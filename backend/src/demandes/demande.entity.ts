import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ajouter_demande')
export class Demande {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  pseudo?: string;

  // Identifiant de l'utilisateur connecté ayant créé la demande.
  @Column({ nullable: true })
  userId?: number;

  @Column()
  nom: string;

  @Column()
  email: string;

  @Column()
  telephone: string;

  @Column()
  adresse: string;

  @Column()
  marque: string;

  @Column()
  categorie: string;

  @Column()
  produit: string;

  @Column({ type: 'integer' })
  quantite: number;

  @Column('text')
  description: string;

  // Indique si un e-mail de notification a déjà été envoyé pour ce client.
  // (Pas de migration ici : TypeORM ne synchronise pas en prod)
  @Column({ default: false })
  emailNotified: boolean;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  date!: string;
}
