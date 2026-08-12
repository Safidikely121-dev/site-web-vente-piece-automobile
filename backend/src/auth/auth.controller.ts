import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Param,
  Patch,
  Delete,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthService, AdminRole } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TechnicalAdminGuard } from './technical-admin.guard';
import { User, isAdminRole } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // =========================
  // LOGIN (acheteurs / vendeurs)
  // =========================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.login(body.email, body.password);
  }

  // =========================
  // LOGIN ADMIN (espace séparé)
  // =========================
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.adminLogin(body.email, body.password);
  }

  // =========================
  // REGISTER (acheteurs / vendeurs uniquement)
  // =========================
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      pseudo: string;
      role?: 'vendeur' | 'acheteur';
      fullName?: string;
      telephone?: string;
      adresse?: string;
    },
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.pseudo,
      body.role,
      body.fullName,
      body.telephone,
      body.adresse,
    );
  }

  // =========================
  // REGISTER ADMIN (réservé à l'admin technique)
  // =========================
  @Post('admin/register')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, TechnicalAdminGuard)
  async registerAdmin(
    @Body()
    body: {
      email: string;
      password: string;
      pseudo: string;
      adminRole: AdminRole;
    },
  ) {
    return this.authService.registerAdmin(
      body.email,
      body.password,
      body.pseudo,
      body.adminRole,
    );
  }

  // =========================
  // HEALTH CHECK
  // =========================
  @Get('health')
  health(): { ok: boolean } {
    return { ok: true };
  }

  // =========================
  // GET USER (profil complet)
  // =========================
  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req: any) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
      select: [
        'id',
        'email',
        'pseudo',
        'role',
        'blocked',
        'fullName',
        'telephone',
        'adresse',
        'createdAt',
      ],
    });
    return user;
  }

  // =========================
  // UPDATE PROFILE (infos de livraison du client)
  // =========================
  @Patch('user')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Req() req: { user: { id: number } },
    @Body()
    body: {
      fullName?: string;
      telephone?: string;
      adresse?: string;
    },
  ) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (body.fullName !== undefined) user.fullName = body.fullName;
    if (body.telephone !== undefined) user.telephone = body.telephone;
    if (body.adresse !== undefined) user.adresse = body.adresse;

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      pseudo: user.pseudo,
      role: user.role,
      fullName: user.fullName,
      telephone: user.telephone,
      adresse: user.adresse,
    };
  }

  // =========================
  // GET ALL USERS (admin technique)
  // =========================
  @Get('users')
  @UseGuards(JwtAuthGuard, TechnicalAdminGuard)
  async getAllUsers() {
    const users = await this.userRepository.find({
      select: [
        'id',
        'email',
        'pseudo',
        'role',
        'blocked',
        'fullName',
        'telephone',
        'adresse',
        'createdAt',
      ],
      order: { createdAt: 'DESC' },
    });
    return users;
  }

  // =========================
  // BLOCK / UNBLOCK USER (admin technique)
  // =========================
  @Patch('users/:id/block')
  @UseGuards(JwtAuthGuard, TechnicalAdminGuard)
  async toggleBlockUser(
    @Param('id') id: string,
    @Body() body: { blocked: boolean },
  ) {
    const user = await this.userRepository.findOne({
      where: { id: Number(id) },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    if (isAdminRole(user.role)) {
      throw new ForbiddenException('Impossible de bloquer un administrateur');
    }
    user.blocked = body.blocked;
    await this.userRepository.save(user);
    return { success: true, blocked: user.blocked };
  }

  // =========================
  // DELETE USER (admin technique)
  // =========================
  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, TechnicalAdminGuard)
  async deleteUser(@Param('id') id: string) {
    const user = await this.userRepository.findOne({
      where: { id: Number(id) },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    if (isAdminRole(user.role)) {
      throw new ForbiddenException('Impossible de supprimer un administrateur');
    }
    await this.userRepository.remove(user);
    return { success: true, message: 'Utilisateur supprimé' };
  }
}
