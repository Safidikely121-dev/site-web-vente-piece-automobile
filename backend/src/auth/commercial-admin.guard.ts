import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Autorise uniquement un administrateur commercial (admin_commercial).
 * Gestion des ventes, commandes, produits, demandes et activité commerciale.
 */
@Injectable()
export class CommercialAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'admin_commercial') {
      throw new ForbiddenException(
        'Accès réservé à l’administrateur commercial',
      );
    }

    return true;
  }
}
