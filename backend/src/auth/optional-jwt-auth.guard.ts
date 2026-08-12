import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Garde JWT optionnelle : ne rejette pas les requêtes anonymes.
 * Si aucun token (ou token invalide) est fourni, `req.user` vaut `null`.
 * Permet aux endpoints publics (listes de produits) d'appliquer un filtrage
 * spécifique quand l'utilisateur est identifié (ex : un vendeur ne voit que
 * ses propres produits).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
