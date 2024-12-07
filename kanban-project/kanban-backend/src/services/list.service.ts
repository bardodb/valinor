import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from '../entities/list.entity';
import { CreateListDto, UpdateListDto } from '../dto/list.dto';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private listRepository: Repository<List>,
  ) {}

  async create(createListDto: CreateListDto): Promise<List> {
    const list = this.listRepository.create(createListDto);
    return await this.listRepository.save(list);
  }

  async findAll(): Promise<List[]> {
    return await this.listRepository.find({
      relations: ['cards'],
      order: { position: 'ASC' },
    });
  }

  async findOne(id: number): Promise<List> {
    return await this.listRepository.findOne({
      where: { id },
      relations: ['cards'],
    });
  }

  async update(id: number, updateListDto: UpdateListDto): Promise<List> {
    await this.listRepository.update(id, updateListDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.listRepository.delete(id);
  }
}
