export interface Card {
  id: string;
  title: string;
  description: string;
  color: string;
  listId: string;
  order: number;
}

export interface List {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  lists: List[];
}

export interface CreateListInput {
  title: string;
  order: number;
}

export interface CreateCardInput {
  title: string;
  description: string;
  color: string;
  listId: string;
  order: number;
}

export interface UpdateCardInput {
  id: string;
  title?: string;
  description?: string;
  color?: string;
  listId?: string;
  order?: number;
}

export interface UpdateListInput {
  id: string;
  title?: string;
  order?: number;
}

export interface BulkUpdateCardsInput {
  cards: {
    id: string;
    order: number;
    listId?: string;
  }[];
}

export interface BulkUpdateListsInput {
  lists: {
    id: string;
    order: number;
  }[];
}
