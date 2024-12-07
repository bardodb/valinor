import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { CreateCardDto, UpdateCardDto } from '../dto/card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const card = this.cardRepository.create(createCardDto);
    return await this.cardRepository.save(card);
  }

  async findAll(): Promise<Card[]> {
    return await this.cardRepository.find({
      relations: ['list'],
      order: { position: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Card> {
    return await this.cardRepository.findOne({ 
      where: { id },
      relations: ['list'],
    });
  }

  async update(id: number, updateCardDto: UpdateCardDto): Promise<Card> {
    await this.cardRepository.update(id, updateCardDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.cardRepository.delete(id);
  }
}
