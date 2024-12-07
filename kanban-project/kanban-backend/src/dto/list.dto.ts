import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateListDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  position: number;
}

export class UpdateListDto {
  @IsString()
  title?: string;

  @IsNumber()
  @Min(0)
  position?: number;
}
