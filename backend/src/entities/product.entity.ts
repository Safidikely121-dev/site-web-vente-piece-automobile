import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Category } from './category.entity';
import { User } from './user.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prix: string;

  @Column({ nullable: true })
  marque?: string;

  @Column({ nullable: true })
  description?: string;

  // ==========================
  // NOUVEAUX CHAMPS
  // ==========================

  @Column({ nullable: true })
  image?: string;

  @Column({
    default: 'Neuf',
  })
  etat: string;

  @Column({ nullable: true })
  contact?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  adresse?: string;

  @Column({ nullable: true })
  sousCategorie?: string;

  // ==========================
  // CATEGORIE
  // ==========================

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({
    name: 'categoryId',
  })
  category: Category;

  @Column()
  categoryId: number;

  // ==========================
  // VENDEUR
  // ==========================

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'userId',
  })
  vendeur: User;

  @Column({
    nullable: true,
  })
  userId?: number;
}
