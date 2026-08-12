import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Demande } from './demande.entity';

@Injectable()
export class DemandesService {
  constructor(
    @InjectRepository(Demande)
    private readonly demandeRepository: Repository<Demande>,
  ) {}

  async create(
    demandeData: Partial<Demande>,
    user: { id: number; email: string; pseudo?: string },
  ): Promise<Demande> {
    const quantiteNum = Number((demandeData as any)?.quantite);

    const demande = this.demandeRepository.create({
      ...demandeData,
      // Les informations d'identité proviennent du compte connecté (JWT),
      // jamais du corps de la requête.
      userId: user.id,
      nom: user.pseudo || demandeData.nom,
      email: user.email,
      pseudo: user.pseudo,
      quantite: Number.isFinite(quantiteNum) ? quantiteNum : 1,
    });

    return this.demandeRepository.save(demande);
  }

  async findAll(): Promise<Demande[]> {
    return this.demandeRepository.find({
      order: { date: 'DESC' },
    });
  }
}
