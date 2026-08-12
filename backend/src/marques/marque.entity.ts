import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Marque automobile (ex: Toyota, Bosch, ...).
 *
 * Complète les 20 marques déjà affichées en dur côté frontend
 * (Entreprises.jsx) en permettant aux vendeurs d'en ajouter de nouvelles
 * depuis le formulaire "+ Ajouter marques".
 */
@Entity('marque')
export class Marque {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nom: string;

  // URL ou chemin d'une image/logo (optionnel).
  @Column({ nullable: true })
  logo?: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  date!: string;
}
