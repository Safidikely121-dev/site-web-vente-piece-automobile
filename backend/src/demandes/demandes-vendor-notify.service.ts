import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Demande } from './demande.entity';
import { User } from '../entities/user.entity';
import { EmailService } from '../email/email.service';
import { AiService } from '../ai/ai.service';

/**
 * Fonctionnalité IA n°7 : lorsqu'un client publie une demande de pièce
 * indisponible, on prévient automatiquement les vendeurs afin qu'ils
 * puissent publier rapidement le produit recherché.
 */
@Injectable()
export class DemandesVendorNotifyService {
  private readonly logger = new Logger(DemandesVendorNotifyService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly aiService: AiService,
  ) {}

  async notifyVendorsForNewDemande(demande: Demande): Promise<void> {
    try {
      // L'IA structure/analyse la demande pour produire un résumé exploitable
      // par les vendeurs (facultatif : fonctionne aussi sans clé API configurée).
      const analysis = await this.aiService.analyzeDemande({
        marque: demande.marque,
        categorie: demande.categorie,
        produit: demande.produit,
        description: demande.description,
      });

      const vendeurs = await this.userRepository.find({
        where: { role: 'vendeur', blocked: false },
      });

      if (vendeurs.length === 0) {
        this.logger.log('Aucun vendeur actif à notifier pour cette demande.');
        return;
      }

      await Promise.allSettled(
        vendeurs.map((vendeur) =>
          this.emailService.sendVendorDemandeAlert({
            to: vendeur.email,
            vendeurPseudo: vendeur.pseudo,
            marque: analysis?.marqueVehicule || demande.marque,
            categorie: demande.categorie,
            produit: demande.produit,
            quantite: demande.quantite,
            description: demande.description,
            resumeIa: analysis?.resume,
          }),
        ),
      );

      this.logger.log(
        `Alerte demande #${demande.id} envoyée à ${vendeurs.length} vendeur(s).`,
      );
    } catch (error: any) {
      this.logger.error(
        `Erreur notification vendeurs pour demande #${demande.id} : ${error?.message || error}`,
      );
    }
  }
}
