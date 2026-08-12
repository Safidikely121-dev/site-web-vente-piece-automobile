import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { User, UserRole, isAdminRole } from '../entities/user.entity';
import { EmailService } from '../email/email.service';

export type PublicRole = 'vendeur' | 'acheteur';
export type AdminRole = 'admin_technique' | 'admin_commercial';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret =
    process.env.JWT_SECRET ?? 'your-super-secret-jwt-key-change-in-prod';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Inscription des acheteurs et vendeurs uniquement.
   * La création des comptes administrateurs passe par registerAdmin()
   * (réservée à l'administrateur technique).
   */
  async register(
    email: string,
    password: string,
    pseudo: string,
    role: PublicRole = 'acheteur',
    fullName?: string,
    telephone?: string,
    adresse?: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    if (role !== 'vendeur' && role !== 'acheteur') {
      return {
        success: false,
        message: 'Rôle invalide pour l’inscription publique',
      };
    }

    const existing = await this.userRepository.findOne({
      where: { email },
    });

    if (existing) {
      return {
        success: false,
        message: 'Email already used',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      pseudo,
      role,
      fullName,
      telephone,
      adresse,
    });

    await this.userRepository.save(user);

    this.logger.log(`Nouvel utilisateur inscrit : ${user.email}`);

    await this.emailService.sendWelcomeEmail({
      to: user.email,
      pseudo: user.pseudo,
    });

    this.logger.log(`Mail de bienvenue envoyé à ${user.email}`);

    // MAIL ADMIN
    await this.emailService.sendRoleRegistrationNotification({
      pseudo,
      email,
      role,
    });

    return {
      success: true,
      message: 'Inscription réussie',
    };
  }

  /**
   * Création d'un compte administrateur.
   * Réservée à l'administrateur technique (guard sur le contrôleur).
   * Maximum : un administrateur par type.
   */
  async registerAdmin(
    email: string,
    password: string,
    pseudo: string,
    adminRole: AdminRole,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    if (adminRole !== 'admin_technique' && adminRole !== 'admin_commercial') {
      return {
        success: false,
        message: 'Type d’administrateur invalide',
      };
    }

    const existing = await this.userRepository.findOne({
      where: { email },
    });

    if (existing) {
      return {
        success: false,
        message: 'Email already used',
      };
    }

    const count = await this.userRepository.count({
      where: { role: adminRole },
    });

    if (count >= 1) {
      return {
        success: false,
        message:
          adminRole === 'admin_technique'
            ? 'Un administrateur technique existe déjà (maximum 1)'
            : 'Un administrateur commercial existe déjà (maximum 1)',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      pseudo,
      role: adminRole,
    });

    await this.userRepository.save(user);

    this.logger.log(
      `Nouvel administrateur créé : ${user.email} (${adminRole})`,
    );

    await this.emailService.sendRoleRegistrationNotification({
      pseudo,
      email,
      role: adminRole,
    });

    return {
      success: true,
      message: 'Compte administrateur créé avec succès',
    };
  }

  private async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    return user;
  }

  private buildToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      pseudo: user.pseudo,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '24h',
    });
  }

  private toSafeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      pseudo: user.pseudo,
      role: user.role,
    };
  }

  /**
   * Connexion acheteur / vendeur.
   * Les administrateurs doivent utiliser l'espace dédié (adminLogin).
   */
  async login(
    email: string,
    password: string,
  ): Promise<{
    token: string;
    user: {
      id: number;
      email: string;
      pseudo?: string;
      role: UserRole;
    };
  }> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (isAdminRole(user.role)) {
      throw new UnauthorizedException(
        'Connectez-vous via l’espace administrateur',
      );
    }

    if (user.blocked) {
      throw new UnauthorizedException(
        "Votre compte a été bloqué. Veuillez contacter l'administrateur.",
      );
    }

    const token = this.buildToken(user);

    await this.emailService.sendRoleLoginNotification({
      pseudo: user.pseudo,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: this.toSafeUser(user),
    };
  }

  /**
   * Connexion administrateur uniquement (espace séparé).
   */
  async adminLogin(
    email: string,
    password: string,
  ): Promise<{
    token: string;
    user: {
      id: number;
      email: string;
      pseudo?: string;
      role: UserRole;
    };
  }> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!isAdminRole(user.role)) {
      throw new UnauthorizedException(
        'Ce compte n’a pas accès à l’espace administrateur',
      );
    }

    if (user.blocked) {
      throw new UnauthorizedException(
        "Compte bloqué. Contactez l'administrateur.",
      );
    }

    const token = this.buildToken(user);

    await this.emailService.sendRoleLoginNotification({
      pseudo: user.pseudo,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: this.toSafeUser(user),
    };
  }
}
