import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Card {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  color: string;

  @Field()
  listId: string;

  @Field()
  order: number;
}

@ObjectType()
export class List {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  order: number;

  @Field(() => [Card])
  cards: Card[];
}

@ObjectType()
export class Board {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => [List])
  lists: List[];
}

@InputType()
export class CreateListInput {
  @Field()
  title: string;

  @Field()
  order: number;
}

@InputType()
export class CreateCardInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  color: string;

  @Field()
  listId: string;

  @Field()
  order: number;
}

@InputType()
export class UpdateCardInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  listId?: string;

  @Field({ nullable: true })
  order?: number;
}

@InputType()
export class UpdateListInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  order?: number;
}

@InputType()
export class BulkCardUpdate {
  @Field(() => ID)
  id: string;

  @Field()
  order: number;

  @Field({ nullable: true })
  listId?: string;
}

@InputType()
export class BulkUpdateCardsInput {
  @Field(() => [BulkCardUpdate])
  cards: BulkCardUpdate[];
}

@InputType()
export class BulkListUpdate {
  @Field(() => ID)
  id: string;

  @Field()
  order: number;
}

@InputType()
export class BulkUpdateListsInput {
  @Field(() => [BulkListUpdate])
  lists: BulkListUpdate[];
}
