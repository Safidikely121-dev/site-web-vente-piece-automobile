import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Patch,
  UseGuards,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommercialAdminGuard } from '../auth/commercial-admin.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../entities/user.entity';

interface AuthenticatedRequest {
  user: { id: number };
}

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Création d'une commande.
   * Réservée à un client connecté : les informations de livraison
   * (nom, contact, adresse) sont récupérées automatiquement depuis le compte.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() orderData: CreateOrderDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Order> {
    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    if (!user.fullName || !user.telephone || !user.adresse) {
      throw new BadRequestException(
        'Votre compte ne possède pas encore vos informations de livraison (nom, téléphone, adresse). Impossible de passer la commande.',
      );
    }

    const resolved = {
      ...orderData,
      client: user.fullName,
      email: user.email,
      telephone: user.telephone,
      adresse: user.adresse,
    };

    return this.ordersService.create(resolved);
  }

  @Get()
  @UseGuards(JwtAuthGuard, CommercialAdminGuard)
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, CommercialAdminGuard)
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    await this.ordersService.remove(Number(id));
    return { deleted: true };
  }

  @Patch(':id/delivery')
  @UseGuards(JwtAuthGuard, CommercialAdminGuard)
  async updateDelivery(
    @Param('id') id: string,
    @Body() body: { delivered: boolean },
  ): Promise<Order> {
    return this.ordersService.updateDelivery(Number(id), body.delivered);
  }
}
