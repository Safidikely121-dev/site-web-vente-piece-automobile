import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import type { UserRole } from '../entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Construit le message adressé à l'administrateur en fonction du rôle
   * de l'utilisateur qui vient de se connecter.
   */
  buildLoginMessage(role: UserRole, identifiant: string): string {
    if (role === 'vendeur') {
      return `${identifiant} : je souhaite vendre des produits ici.`;
    }
    return `${identifiant} : je souhaite acheter des produits ici.`;
  }

  /**
   * Enregistre une notification pour l'administrateur, liée à un utilisateur.
   */
  async notifyAdminOnLogin(user: {
    id: number;
    email: string;
    pseudo?: string;
    role: UserRole;
  }): Promise<Notification> {
    const identifiant = user.pseudo || user.email;
    const message = this.buildLoginMessage(user.role, identifiant);

    const notification = this.notificationRepository.create({
      message,
      userId: user.id,
      userEmail: user.email,
      userPseudo: user.pseudo,
      role: user.role,
    });

    return this.notificationRepository.save(notification);
  }

  /**
   * Retourne toutes les notifications, les plus récentes en premier.
   */
  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.find({
      order: { id: 'DESC' },
    });
  }

  /**
   * Marque une notification comme lue par l'administrateur.
   */
  async markAsRead(id: number): Promise<void> {
    await this.notificationRepository.update(id, { lu: true });
  }
}
