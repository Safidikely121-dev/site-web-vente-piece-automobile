import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Demande } from './demande.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class DemandesAvailabilityService {
  private readonly logger = new Logger(DemandesAvailabilityService.name);
  constructor(
    @InjectRepository(Demande)
    private readonly demandeRepository: Repository<Demande>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Cherche les demandes dont le produit recherché correspond au produit disponible.
   * Ensuite envoie l'e-mail et marque la demande comme notifiée.
   */
  async notifyClientsWhenProductAvailable(payload: {
    produit: string;
    categorie?: string;
    marque?: string;
    produitNomOuRef?: string;
  }) {
    const produit = payload.produit || payload.produitNomOuRef;

    if (!produit) {
      this.logger.warn('Aucun produit fourni dans le payload');
      return;
    }

    const produitNorm = String(produit).trim().toLowerCase();
    const categorieNorm = payload.categorie
      ? String(payload.categorie).trim().toLowerCase()
      : undefined;
    const marqueNorm = payload.marque
      ? String(payload.marque).trim().toLowerCase()
      : undefined;

    this.logger.log(`Produit ajouté : ${produitNorm}`);
    this.logger.log(`Catégorie : ${categorieNorm || 'Non spécifiée'}`);
    this.logger.log(`Marque : ${marqueNorm || 'Non spécifiée'}`);

    // Récupère toutes les demandes non encore notifiées
    const candidates = await this.demandeRepository.find({
      where: { emailNotified: false },
    });

    this.logger.log(`Demandes totales non notifiées : ${candidates.length}`);

    // Fonction de normalisation des chaînes (enlever accents, caractères spéciaux)
    const normalizeStr = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Fonction qui vérifie si une demande correspond au produit (par nom)
    const matchProductName = (d: Demande): boolean => {
      const demandeProduit = String(d.produit ?? '')
        .trim()
        .toLowerCase();
      const desc = String(d.description ?? '')
        .trim()
        .toLowerCase();

      const produitNormClean = normalizeStr(produitNorm);
      const demandeProduitClean = normalizeStr(demandeProduit);
      const descClean = normalizeStr(desc);

      return (
        produitNormClean.includes(demandeProduitClean) ||
        demandeProduitClean.includes(produitNormClean) ||
        descClean.includes(produitNormClean)
      );
    };

    // Étape 1: Essayer avec les filtres stricts (catégorie + marque + nom)
    let toNotify = candidates.filter((d) => {
      // 1) Filtrer par catégorie si le produit a une catégorie
      if (categorieNorm) {
        const demandeCategorie = String(d.categorie ?? '')
          .trim()
          .toLowerCase();
        if (demandeCategorie !== categorieNorm) {
          return false;
        }
      }

      // 2) Filtrer par marque si le produit a une marque
      if (marqueNorm) {
        const demandeMarque = String(d.marque ?? '')
          .trim()
          .toLowerCase();
        if (demandeMarque && demandeMarque !== marqueNorm) {
          // Si la demande spécifie une marque différente, on ne match pas
          return false;
        }
      }

      // 3) Faire correspondre le nom du produit
      return matchProductName(d);
    });

    // Étape 2: Si aucun résultat avec les filtres stricts,
    // réessayer SANS le filtre de catégorie (car la catégorie est un champ libre tapé par l'utilisateur)
    if (toNotify.length === 0) {
      this.logger.log(
        'Aucune correspondance avec catégorie. Tentative sans filtre de catégorie...',
      );
      toNotify = candidates.filter((d) => {
        // Garder le filtre de marque si présent
        if (marqueNorm) {
          const demandeMarque = String(d.marque ?? '')
            .trim()
            .toLowerCase();
          if (demandeMarque && demandeMarque !== marqueNorm) {
            return false;
          }
        }
        return matchProductName(d);
      });
    }

    // Log des résultats
    toNotify.forEach((d) => {
      this.logger.log(
        `Correspondance trouvée : Demande #${d.id} (${d.email}) - Produit: "${d.produit}"`,
      );
    });

    this.logger.log(`Nombre de clients à notifier : ${toNotify.length}`);

    if (toNotify.length === 0) {
      this.logger.log('Aucun client à notifier pour ce produit.');
      return;
    }

    await Promise.allSettled(
      toNotify.map(async (d) => {
        try {
          await this.emailService.sendProductAvailableEmail({
            to: d.email,
            clientName: d.nom,
            productName: produit,
          });

          d.emailNotified = true;
          await this.demandeRepository.save(d);

          this.logger.log(
            `Email envoyé avec succès à : ${d.email} (Demande #${d.id})`,
          );
        } catch (error) {
          const err = error as Error;
          this.logger.error(`Erreur envoi email à ${d.email}: ${err.message}`);
        }
      }),
    );
  }
}
