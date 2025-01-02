import { Args, ID, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Board, Card, CreateCardInput, CreateListInput, List, UpdateCardInput, UpdateListInput, BulkUpdateCardsInput, BulkUpdateListsInput } from './types';
import { KanbanService } from '../services/kanban.service';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

const CARD_UPDATED = 'cardUpdated';
const LIST_UPDATED = 'listUpdated';
const BOARD_UPDATED = 'boardUpdated';

@Resolver(() => Board)
export class KanbanResolver {
  constructor(
    private kanbanService: KanbanService,
    @Inject('PUB_SUB') private pubSub: PubSub
  ) {}

  @Query(() => Board, { name: 'board' })
  async board(@Args('id', { type: () => ID }) id: string) {
    return this.kanbanService.getBoard(id);
  }

  @Query(() => [Board], { name: 'boards' })
  async getBoards() {
    return [await this.kanbanService.getBoard('1')];
  }

  @Mutation(() => List, { name: 'createList' })
  async createList(@Args('input', { type: () => CreateListInput }) input: CreateListInput) {
    const newList = await this.kanbanService.createList(input);
    const board = await this.kanbanService.getBoard('1');
    this.pubSub.publish(BOARD_UPDATED, { boardUpdated: board });
    return newList;
  }

  @Mutation(() => List, { name: 'updateList' })
  async updateList(@Args('input', { type: () => UpdateListInput }) input: UpdateListInput) {
    const updatedList = await this.kanbanService.updateList(input);
    const board = await this.kanbanService.getBoard('1');
    this.pubSub.publish(BOARD_UPDATED, { boardUpdated: board });
    return updatedList;
  }

  @Mutation(() => Boolean, { name: 'deleteList' })
  async deleteList(@Args('id', { type: () => ID }) id: string) {
    const result = await this.kanbanService.deleteList(id);
    const board = await this.kanbanService.getBoard('1');
    this.pubSub.publish(BOARD_UPDATED, { boardUpdated: board });
    return result;
  }

  @Mutation(() => Card, { name: 'createCard' })
  async createCard(@Args('input', { type: () => CreateCardInput }) input: CreateCardInput) {
    const newCard = await this.kanbanService.createCard(input);
    const board = await this.kanbanService.getBoard('1');
    this.pubSub.publish(BOARD_UPDATED, { boardUpdated: board });
    return newCard;
  }

  @Mutation(() => Card, { name: 'updateCard' })
  async updateCard(@Args('input', { type: () => UpdateCardInput }) input: UpdateCardInput) {
    const updatedCard = await this.kanbanService.updateCard(input);
    if (updatedCard) {
      const board = await this.kanbanService.getBoard('1');
      this.pubSub.publish(BOARD_UPDATED, { boardUpdated: board });
    }
    return updatedCard;
  }

  @Mutation(() => Boolean, { name: 'deleteCard' })
  async deleteCard(@Args('id', { type: () => ID }) id: string) {
    const result = await this.kanbanService.deleteCard(id);
    const board = await this.kanbanService.getBoard('1');
    this.pubSub.publish(BOARD_UPDATED, { boardUpdated: board });
    return result;
  }

  @Mutation(() => [Card])
  async bulkUpdateCards(@Args('input') input: BulkUpdateCardsInput) {
    const updatedCards = await this.kanbanService.bulkUpdateCards(input);
    if (updatedCards.length > 0) {
      const board = await this.kanbanService.getBoard('1');
      this.pubSub.publish(BOARD_UPDATED, { boardUpdated: board });
    }
    return updatedCards;
  }

  @Mutation(() => [List])
  async bulkUpdateLists(@Args('input') input: BulkUpdateListsInput) {
    const updatedLists = await this.kanbanService.bulkUpdateLists(input);
    if (updatedLists.length > 0) {
      const board = await this.kanbanService.getBoard('1');
      this.pubSub.publish(BOARD_UPDATED, { boardUpdated: board });
    }
    return updatedLists;
  }

  @Subscription(() => Board, {
    name: 'boardUpdated'
  })
  boardUpdated() {
    return this.pubSub.asyncIterator<Board>(BOARD_UPDATED);
  }
}
