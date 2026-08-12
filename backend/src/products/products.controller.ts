import {
  Body,
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { ProductsService } from './products.service';
import { ProductsAvailabilityService } from './products-availability.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { TechnicalAdminGuard } from '../auth/technical-admin.guard';

import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  // Initialise le controller avec le service.
  constructor(
    private readonly productsService: ProductsService,
    private readonly productsAvailabilityService: ProductsAvailabilityService,
  ) {}

  /**
   * Retourne tous les produits.
   * Authentification optionnelle : un vendeur connecté ne voit que ses propres produits.
   */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getAllProducts(@Req() req: any) {
    return this.productsService.getProducts(req.user);
  }

  /**
   * Retourne les produits correspondant au nom d'une catégorie.
   * Authentification optionnelle : un vendeur connecté ne voit que ses propres produits.
   */
  @Get('category/:category')
  @UseGuards(OptionalJwtAuthGuard)
  async getProductsByCategory(
    @Param('category') category: string,
    @Req() req: any,
  ) {
    return this.productsService.getProductsByCategory(category, req.user);
  }

  /**
   * Retourne un produit par ID.
   * Authentification optionnelle : un vendeur connecté ne peut pas voir le produit d'un autre vendeur.
   */
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getProduct(@Param('id') id: string, @Req() req: any) {
    const product = await this.productsService.getProduct(Number(id), req.user);
    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} introuvable`);
    }
    return product;
  }

  /**
   * Crée un produit rattaché à une catégorie existante (par son nom).
   * Protégé par JWT : réservé aux vendeurs et à l'administrateur commercial.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createProduct(@Body() body: CreateProductDto, @Req() req: any) {
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== 'vendeur' && role !== 'admin_commercial') {
      throw new ForbiddenException(
        'Seuls les vendeurs ou l’administrateur commercial peuvent ajouter des produits',
      );
    }

    const created = await this.productsService.createProduct(body, userId);

    // Trigger: quand un produit est créé, envoyer l'email aux demandes correspondantes.
    await this.productsAvailabilityService.notifyClientsForProduct(created.id);

    return created;
  }

  /**
   * Supprime un produit par id.
   * Protégé par JWT : seuls le propriétaire (vendeur) ou un admin peuvent supprimer.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteProduct(@Param('id') id: string, @Req() req: any): Promise<void> {
    const userId = req.user.id;
    const userRole = req.user.role;
    await this.productsService.deleteProduct(Number(id), userId, userRole);
  }
}

@Controller('categories')
export class CategoriesController {
  // Initialise le controller avec le service.
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Retourne toutes les catégories.
   */
  @Get()
  async getAllCategories() {
    return this.productsService.getCategories();
  }

  /**
   * Crée une catégorie (réservé à l'administrateur technique).
   */
  @Post()
  @UseGuards(JwtAuthGuard, TechnicalAdminGuard)
  async createCategory(@Body() body: CreateCategoryDto) {
    return this.productsService.createCategory(body);
  }

  /**
   * Supprime une catégorie (réservé à l'administrateur technique).
   * Supporte : id numérique ou nom (normalisé côté service).
   */
  @Delete(':idOrName')
  @UseGuards(JwtAuthGuard, TechnicalAdminGuard)
  async deleteCategory(@Param('idOrName') idOrName: string): Promise<void> {
    await this.productsService.deleteCategory(idOrName);
  }
}
