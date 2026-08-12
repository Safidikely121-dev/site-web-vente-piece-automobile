import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { MarquesService } from './marques.service';
import { CreateMarqueDto } from './dto/create-marque.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TechnicalAdminGuard } from '../auth/technical-admin.guard';

@Controller('marques')
export class MarquesController {
  constructor(private readonly marquesService: MarquesService) {}

  /**
   * Retourne toutes les marques enregistrées en base
   * (en plus des 20 marques déjà affichées en dur côté frontend).
   */
  @Get()
  async getAll() {
    return this.marquesService.getAll();
  }

  /**
   * Crée une nouvelle marque (réservé à l'administrateur technique).
   */
  @Post()
  @UseGuards(JwtAuthGuard, TechnicalAdminGuard)
  async create(@Body() body: CreateMarqueDto) {
    return this.marquesService.create(body);
  }

  /**
   * Supprime une marque par id ou par nom (réservé à l'administrateur technique).
   */
  @Delete(':idOrName')
  @UseGuards(JwtAuthGuard, TechnicalAdminGuard)
  async delete(@Param('idOrName') idOrName: string): Promise<void> {
    await this.marquesService.delete(idOrName);
  }
}
