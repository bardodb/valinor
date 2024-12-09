import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Board, Card, CreateCardInput, CreateListInput, List, UpdateCardInput, UpdateListInput } from './types';
import { KanbanService } from '../services/kanban.service';

@Resolver(() => Board)
export class KanbanResolver {
  constructor(private kanbanService: KanbanService) {}

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
    return this.kanbanService.createList(input);
  }

  @Mutation(() => List, { name: 'updateList' })
  async updateList(@Args('input', { type: () => UpdateListInput }) input: UpdateListInput) {
    return this.kanbanService.updateList(input);
  }

  @Mutation(() => Boolean, { name: 'deleteList' })
  async deleteList(@Args('id', { type: () => ID }) id: string) {
    return this.kanbanService.deleteList(id);
  }

  @Mutation(() => Card, { name: 'createCard' })
  async createCard(@Args('input', { type: () => CreateCardInput }) input: CreateCardInput) {
    return this.kanbanService.createCard(input);
  }

  @Mutation(() => Card, { name: 'updateCard' })
  async updateCard(@Args('input', { type: () => UpdateCardInput }) input: UpdateCardInput) {
    return this.kanbanService.updateCard(input);
  }

  @Mutation(() => Boolean, { name: 'deleteCard' })
  async deleteCard(@Args('id', { type: () => ID }) id: string) {
    return this.kanbanService.deleteCard(id);
  }
}
