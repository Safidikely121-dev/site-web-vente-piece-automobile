import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { DemandesService } from './demandes.service';
import { Demande } from './demande.entity';
import { DemandesVendorNotifyService } from './demandes-vendor-notify.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommercialAdminGuard } from '../auth/commercial-admin.guard';

@Controller('demandes')
export class DemandesController {
  constructor(
    private readonly demandesService: DemandesService,
    private readonly demandesVendorNotifyService: DemandesVendorNotifyService,
  ) {}

  /**
   * Crée une demande. Réservé aux utilisateurs connectés : le nom, l'email
   * et le pseudo sont récupérés depuis le compte (JWT), pas saisis à la main.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: Partial<Demande>,
    @Req() req: any,
  ): Promise<Demande> {
    const user = req.user;
    const demande = await this.demandesService.create(body, user);

    // IA n°7 : prévenir automatiquement les vendeurs qu'un client
    // recherche cette pièce (ne bloque pas la réponse au client).
    void this.demandesVendorNotifyService.notifyVendorsForNewDemande(demande);

    return demande;
  }

  @Get()
  @UseGuards(JwtAuthGuard, CommercialAdminGuard)
  async findAll(): Promise<Demande[]> {
    return this.demandesService.findAll();
  }
}
