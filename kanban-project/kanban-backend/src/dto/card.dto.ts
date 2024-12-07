export class CreateCardDto {
  title: string;
  description?: string;
  listId: number;
  position?: number;
}

export class UpdateCardDto {
  title?: string;
  description?: string;
  listId?: number;
  position?: number;
}
