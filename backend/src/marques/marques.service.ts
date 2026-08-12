import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Marque } from './marque.entity';
import { CreateMarqueDto } from './dto/create-marque.dto';

@Injectable()
export class MarquesService {
  constructor(
    @InjectRepository(Marque)
    private readonly marqueRepository: Repository<Marque>,
  ) {}

  private normalizeName(input: string): string {
    return (input ?? '').trim().replace(/\s+/g, ' ');
  }

  async getAll(): Promise<Marque[]> {
    return this.marqueRepository.find({ order: { id: 'ASC' } });
  }

  async create(dto: CreateMarqueDto): Promise<Marque> {
    const nom = this.normalizeName(dto.nom);

    const exist = await this.marqueRepository.findOneBy({ nom });

    if (exist) {
      throw new ConflictException('Cette marque existe déjà');
    }

    const marque = this.marqueRepository.create({
      nom,
      logo: dto.logo,
    });

    return this.marqueRepository.save(marque);
  }

  async delete(idOrName: string): Promise<void> {
    const id = Number(idOrName);

    if (!isNaN(id)) {
      await this.marqueRepository.delete({ id });
    } else {
      await this.marqueRepository.delete({ nom: idOrName });
    }
  }
}
