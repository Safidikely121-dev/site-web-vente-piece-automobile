import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Autorise uniquement un administrateur technique (admin_technique).
 * Gestion des utilisateurs, catégories, marques, paramètres et du site.
 */
@Injectable()
export class TechnicalAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'admin_technique') {
      throw new ForbiddenException(
        'Accès réservé à l’administrateur technique',
      );
    }

    return true;
  }
}
