import { Injectable } from '@nestjs/common';
import { Board, Card, CreateCardInput, CreateListInput, List, UpdateCardInput, UpdateListInput } from '../graphql/types';

@Injectable()
export class KanbanService {
  private board: Board = {
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
    if (input.order !== undefined) card.order = input.order;

    if (input.listId && input.listId !== list.id) {
      // Move card to different list
      const newList = this.board.lists.find(l => l.id === input.listId);
      if (!newList) throw new Error('Target list not found');

      // Remove from old list
      list.cards = list.cards.filter(c => c.id !== card!.id);

      // Add to new list
      card.listId = input.listId;
      newList.cards.push(card);
    }

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
}
