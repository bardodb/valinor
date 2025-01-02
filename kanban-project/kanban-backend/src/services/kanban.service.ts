import { Injectable } from '@nestjs/common';
import { 
  Board, 
  Card, 
  CreateCardInput, 
  CreateListInput, 
  List, 
  UpdateCardInput, 
  UpdateListInput, 
  BulkUpdateCardsInput, 
  BulkUpdateListsInput,
  BulkCardUpdate 
} from '../graphql/types';

@Injectable()
export class KanbanService {
  private board: Board;
  private positionUpdateTimeout: NodeJS.Timeout | null = null;
  private pendingPositionUpdates: Map<string, { order?: number, listId?: string }> = new Map();
  private lastKnownStates: Map<string, { order: number, listId: string, color: string }> = new Map();

  constructor() {
    this.board = {
      id: '1',
      title: 'My Kanban Board',
      lists: [
        {
          id: '1',
          title: 'Backlog',
          order: 0,
          cards: [
            {
              id: '1',
              title: 'Research new features',
              description: 'Analyze competitor products',
              color: '#22272b',
              listId: '1',
              order: 0,
            },
            {
              id: '2',
              title: 'Design mockups',
              description: 'Create UI/UX designs',
              color: '#22272b',
              listId: '1',
              order: 1,
            },
          ],
        },
        {
          id: '2',
          title: 'In Progress',
          order: 1,
          cards: [
            {
              id: '3',
              title: 'Implement authentication',
              description: 'Add user login/signup',
              color: '#22272b',
              listId: '2',
              order: 0,
            },
          ],
        },
        {
          id: '3',
          title: 'Review',
          order: 2,
          cards: [],
        },
        {
          id: '4',
          title: 'Done',
          order: 3,
          cards: [
            {
              id: '4',
              title: 'Setup project',
              description: 'Initialize repository and dependencies',
              color: '#22272b',
              listId: '4',
              order: 0,
            },
          ],
        },
      ],
    };
    
    // Initialize last known states
    this.board.lists.forEach(list => {
      list.cards.forEach(card => {
        this.lastKnownStates.set(card.id, {
          order: card.order,
          listId: card.listId,
          color: card.color
        });
      });
    });
  }

  private hasCardChanged(cardId: string, updates: Partial<Card>): boolean {
    const lastState = this.lastKnownStates.get(cardId);
    if (!lastState) return true;

    return (
      (updates.order !== undefined && updates.order !== lastState.order) ||
      (updates.listId !== undefined && updates.listId !== lastState.listId) ||
      (updates.color !== undefined && updates.color !== lastState.color)
    );
  }

  private updateLastKnownState(cardId: string, updates: Partial<Card>) {
    const currentState = this.lastKnownStates.get(cardId) || { order: 0, listId: '', color: '' };
    this.lastKnownStates.set(cardId, {
      ...currentState,
      ...(updates.order !== undefined && { order: updates.order }),
      ...(updates.listId !== undefined && { listId: updates.listId }),
      ...(updates.color !== undefined && { color: updates.color })
    });
  }

  private debouncedPositionUpdate(cardId: string, updates: { order?: number, listId?: string }) {
    // Only queue update if there are actual changes
    if (!this.hasCardChanged(cardId, updates)) {
      return;
    }

    this.pendingPositionUpdates.set(cardId, {
      ...this.pendingPositionUpdates.get(cardId),
      ...updates
    });

    if (this.positionUpdateTimeout) {
      clearTimeout(this.positionUpdateTimeout);
    }

    this.positionUpdateTimeout = setTimeout(() => {
      const bulkUpdates: BulkCardUpdate[] = [];
      this.pendingPositionUpdates.forEach((updates, id) => {
        if (this.hasCardChanged(id, updates)) {
          bulkUpdates.push({
            id,
            ...updates,
            updateType: 'position'
          });
          this.updateLastKnownState(id, updates);
        }
      });

      if (bulkUpdates.length > 0) {
        this.bulkUpdateCards({ cards: bulkUpdates });
      }

      this.pendingPositionUpdates.clear();
      this.positionUpdateTimeout = null;
    }, 500); // Increased debounce delay to 500ms
  }

  async getBoard(id: string): Promise<Board> {
    return this.board;
  }

  async createList(input: CreateListInput): Promise<List> {
    const newList: List = {
      id: Date.now().toString(),
      title: input.title,
      order: input.order,
      cards: [],
    };
    this.board.lists.push(newList);
    return newList;
  }

  async updateList(input: UpdateListInput): Promise<List> {
    const list = this.board.lists.find(l => l.id === input.id);
    if (!list) throw new Error('List not found');

    if (input.title) list.title = input.title;
    if (typeof input.order === 'number') list.order = input.order;

    return list;
  }

  async deleteList(id: string): Promise<boolean> {
    const initialLength = this.board.lists.length;
    this.board.lists = this.board.lists.filter(l => l.id !== id);
    return initialLength > this.board.lists.length;
  }

  async createCard(input: CreateCardInput): Promise<Card> {
    const list = this.board.lists.find(l => l.id === input.listId);
    if (!list) throw new Error('List not found');

    const newCard: Card = {
      id: Date.now().toString(),
      title: input.title,
      description: input.description,
      color: input.color,
      listId: input.listId,
      order: input.order,
    };

    list.cards.push(newCard);
    return newCard;
  }

  async updateCard(input: UpdateCardInput): Promise<Card> {
    // Skip update if no actual changes
    if (!this.hasCardChanged(input.id, input)) {
      const card = this.findCard(input.id);
      if (!card) throw new Error('Card not found');
      return card;
    }

    if (input.updateType === 'position') {
      this.debouncedPositionUpdate(input.id, {
        order: input.order,
        listId: input.listId
      });
      
      const card = this.findCard(input.id);
      if (!card) throw new Error('Card not found');
      return {
        ...card,
        order: input.order ?? card.order,
        listId: input.listId ?? card.listId
      };
    }

    const updatedCard = await this.updateCardContent(input);
    this.updateLastKnownState(input.id, updatedCard);
    return updatedCard;
  }

  private findCard(cardId: string): Card | null {
    for (const list of this.board.lists) {
      const card = list.cards.find(c => c.id === cardId);
      if (card) return card;
    }
    return null;
  }

  private updateCardContent(input: UpdateCardInput): Card {
    let card: Card | undefined;
    let list: List | undefined;

    for (const l of this.board.lists) {
      card = l.cards.find(c => c.id === input.id);
      if (card) {
        list = l;
        break;
      }
    }

    if (!card || !list) throw new Error('Card not found');

    if (input.title) card.title = input.title;
    if (input.description) card.description = input.description;
    if (input.color) card.color = input.color;

    return card;
  }

  async deleteCard(id: string): Promise<boolean> {
    let found = false;
    for (const list of this.board.lists) {
      const initialLength = list.cards.length;
      list.cards = list.cards.filter(c => c.id !== id);
      if (initialLength > list.cards.length) {
        found = true;
        break;
      }
    }
    return found;
  }

  bulkUpdateCards(input: BulkUpdateCardsInput): Card[] {
    const updatedCards: Card[] = [];
    const listUpdates = new Map<string, Card[]>();

    // Only process cards that have actual changes
    input.cards.forEach(updateData => {
      if (!this.hasCardChanged(updateData.id, updateData)) return;

      const card = this.findCard(updateData.id);
      if (!card) return;

      const targetListId = updateData.listId || card.listId;
      if (!listUpdates.has(targetListId)) {
        listUpdates.set(targetListId, []);
      }

      const updatedCard = { ...card };
      if (updateData.order !== undefined) updatedCard.order = updateData.order;
      if (updateData.listId) updatedCard.listId = updateData.listId;

      listUpdates.get(targetListId)!.push(updatedCard);
      updatedCards.push(updatedCard);
      this.updateLastKnownState(updateData.id, updatedCard);
    });

    if (updatedCards.length === 0) return [];

    // Apply updates in batch per list
    listUpdates.forEach((cards, listId) => {
      const list = this.board.lists.find(l => l.id === listId);
      if (!list) return;

      list.cards = list.cards.filter(card => 
        !cards.some(updatedCard => updatedCard.id === card.id)
      );
      list.cards.push(...cards);
      list.cards.sort((a, b) => a.order - b.order);
    });

    return updatedCards;
  }

  bulkUpdateLists(input: BulkUpdateListsInput): List[] {
    const updatedLists: List[] = [];

    input.lists.forEach(updateData => {
      const listIndex = this.board.lists.findIndex(l => l.id === updateData.id);
      if (listIndex !== -1) {
        const list = this.board.lists[listIndex];
        const updatedList = {
          ...list,
          order: updateData.order
        };
        this.board.lists[listIndex] = updatedList;
        updatedLists.push(updatedList);
      }
    });

    // Sort lists by order
    this.board.lists.sort((a, b) => a.order - b.order);

    return updatedLists;
  }
}
