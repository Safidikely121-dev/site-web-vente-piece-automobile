import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  client: string;

  @Column()
  email: string;

  @Column()
  telephone: string;

  @Column()
  adresse: string;

  @Column()
  paiement: string;

  @Column()
  produit: string;

  @Column()
  prix: string;

  @Column({ default: false })
  delivered: boolean;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  date!: string;
}
