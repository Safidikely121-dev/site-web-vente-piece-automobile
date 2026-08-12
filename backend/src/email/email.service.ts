import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { UserRole } from '../entities/user.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private buildTransport() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    if (!user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  async sendRoleRegistrationNotification(params: {
    pseudo?: string;
    email: string;
    role: UserRole;
  }) {
    const { pseudo, email, role } = params;

    const adminEmail = process.env.ADMIN_EMAIL;
    const transport = this.buildTransport();

    const roleMessage =
      role === 'vendeur'
        ? 'Je souhaite vendre des produits sur cette plateforme.'
        : role === 'admin_technique' || role === 'admin_commercial'
          ? 'Un compte administrateur a été créé.'
          : 'Je souhaite acheter des produits sur cette plateforme.';

    const subject =
      role === 'vendeur'
        ? 'Nouvelle inscription vendeur - AutoParts'
        : role === 'admin_technique' || role === 'admin_commercial'
          ? 'Nouveau compte administrateur - AutoParts'
          : 'Nouvelle inscription acheteur - AutoParts';

    const text = `
Bonjour,

Un nouvel utilisateur vient de s'inscrire sur AutoParts.

Pseudo : ${pseudo ?? 'Non renseigné'}
Email : ${email}
Rôle : ${role}

Message :
${roleMessage}

Notification automatique.
`;

    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL non configuré dans le fichier .env');
      return;
    }

    if (!transport) {
      this.logger.warn(
        'EMAIL_USER ou EMAIL_PASSWORD non configuré dans le fichier .env',
      );
      return;
    }

    try {
      await transport.sendMail({
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject,
        text,
      });

      this.logger.log(`Email envoyé avec succès à ${adminEmail}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erreur envoi email : ${err.message}`);
    }
  }

  async sendRoleLoginNotification(params: {
    pseudo?: string;
    email: string;
    role: UserRole;
  }) {
    return this.sendRoleRegistrationNotification(params);
  }

  async sendProductAvailableEmail(params: {
    to: string;
    clientName?: string;
    productName: string;
  }) {
    const { to, clientName, productName } = params;

    const transport = this.buildTransport();

    if (!transport) {
      this.logger.warn('Email non envoyé : configuration Gmail absente');
      return;
    }

    try {
      await transport.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Produit disponible - AutoParts',
        text: `
Bonjour ${clientName ?? ''},

Le produit "${productName}" est disponible maintenant.

Merci de votre confiance.
AutoParts
`,
      });

      this.logger.log(`Email produit envoyé à ${to}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erreur envoi email produit : ${err.message}`);
    }
  }
  async sendVendorDemandeAlert(params: {
    to: string;
    vendeurPseudo?: string;
    marque?: string;
    categorie?: string;
    produit: string;
    quantite?: number;
    description?: string;
    resumeIa?: string;
  }) {
    const {
      to,
      vendeurPseudo,
      marque,
      categorie,
      produit,
      quantite,
      description,
      resumeIa,
    } = params;

    const transport = this.buildTransport();

    if (!transport) {
      this.logger.warn(
        'Email non envoyé (alerte vendeur) : configuration Gmail absente',
      );
      return;
    }

    try {
      await transport.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: `Nouvelle demande client - ${produit}`,
        text: `
Bonjour ${vendeurPseudo ?? ''},

Un client recherche une pièce que vous pourriez avoir en stock :

Pièce recherchée : ${produit}
Marque : ${marque ?? 'Non précisée'}
Catégorie : ${categorie ?? 'Non précisée'}
Quantité souhaitée : ${quantite ?? 1}
${resumeIa ? `Résumé : ${resumeIa}\n` : ''}Description du client : ${description ?? 'Non précisée'}

Si vous disposez de cette pièce, publiez-la dès maintenant sur AutoParts :
le client recevra automatiquement un e-mail dès que votre produit sera en ligne.

AutoParts
`,
      });

      this.logger.log(`Alerte demande envoyée au vendeur ${to}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erreur envoi alerte vendeur à ${to} : ${err.message}`);
    }
  }

  /**
   * Méthode générique pour envoyer un email.
   */
  async sendMail(params: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    const transport = this.buildTransport();

    if (!transport) {
      this.logger.warn('Email non envoyé : configuration Gmail absente');
      return;
    }

    try {
      await transport.sendMail({
        from: process.env.EMAIL_USER,
        to: params.to,
        subject: params.subject,
        text: params.text,
      });

      this.logger.log(`Email envoyé avec succès à ${params.to}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erreur envoi email : ${err.message}`);
    }
  }

  async sendWelcomeEmail(params: { to: string; pseudo?: string }) {
    const transport = this.buildTransport();

    if (!transport) {
      this.logger.warn('Configuration Gmail absente');
      return;
    }

    try {
      await transport.sendMail({
        from: process.env.EMAIL_USER,
        to: params.to,
        subject: 'Bienvenue sur AutoParts',
        text: `
Bonjour ${params.pseudo ?? ''},

Votre inscription sur AutoParts a été effectuée avec succès.

Merci de votre confiance.

L'équipe AutoParts
`,
      });

      this.logger.log(`Email de bienvenue envoyé à ${params.to}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erreur envoi email client : ${err.message}`);
    }
  }
}
