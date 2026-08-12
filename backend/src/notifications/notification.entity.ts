import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Notification destinée à l'administrateur.
 * Créée automatiquement lorsqu'un utilisateur (vendeur ou acheteur) se connecte,
 * afin d'informer l'administrateur de son intention (vendre / acheter).
 */
@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  // Contenu du message affiché à l'administrateur.
  @Column('text')
  message: string;

  // Référence à l'utilisateur à l'origine de la notification.
  @Column({ nullable: true })
  userId?: number;

  @Column({ nullable: true })
  userEmail?: string;

  @Column({ nullable: true })
  userPseudo?: string;

  // Rôle de l'utilisateur au moment de la notification ('vendeur' | 'acheteur').
  @Column({ nullable: true })
  role?: string;

  // Indique si l'administrateur a déjà consulté cette notification.
  @Column({ default: false })
  lu: boolean;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  date!: string;
}
