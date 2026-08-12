import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Category {
  // Identifiant unique de la catégorie
  @PrimaryGeneratedColumn()
  id: number;

  // Nom lisible de la catégorie
  @Column({ unique: true })
  name: string;

  // Liste des produits rattachés à cette catégorie
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
