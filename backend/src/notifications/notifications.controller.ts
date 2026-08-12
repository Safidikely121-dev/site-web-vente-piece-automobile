import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TechnicalAdminGuard } from '../auth/technical-admin.guard';

/**
 * Endpoints consultés par l'administrateur technique pour suivre les
 * demandes de connexion / inscriptions des vendeurs et acheteurs.
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard, TechnicalAdminGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll() {
    return this.notificationsService.findAll();
  }

  @Patch(':id/lu')
  async markAsRead(@Param('id') id: string) {
    await this.notificationsService.markAsRead(Number(id));
    return { success: true };
  }
}
