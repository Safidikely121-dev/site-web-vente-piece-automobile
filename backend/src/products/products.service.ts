import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';

import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  private normalizeCategoryName(input: string): string {
    return (input ?? '').trim().replace(/\s+/g, ' ');
  }

  async onModuleInit() {
    const count = await this.categoryRepository.count();

    if (count > 0) return;

    const categories = [
      { name: 'Moteur' },
      { name: 'Freinage' },
      { name: 'Suspension' },
      { name: 'Éclairage' },
      { name: 'Roue' },
    ];

    await this.categoryRepository.save(categories);
  }

  async getProducts(requester?: {
    id: number;
    role?: string;
  }): Promise<Product[]> {
    // Un vendeur ne voit que ses propres produits ; les autres (acheteurs,
    // admins, visiteurs) voient tout le catalogue.
    const where = requester?.role === 'vendeur' ? { userId: requester.id } : {};

    return this.productRepository.find({
      where,
      relations: ['category', 'vendeur'],
    });
  }

  async getProduct(
    id: number,
    requester?: { id: number; role?: string },
  ): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'vendeur'],
    });

    if (!product) {
      return null;
    }

    // Un vendeur ne peut pas consulter le produit d'un autre vendeur.
    if (requester?.role === 'vendeur' && product.userId !== requester.id) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à voir ce produit.",
      );
    }

    return product;
  }

  async getProductsByCategory(
    category: string,
    requester?: { id: number; role?: string },
  ): Promise<Product[]> {
    const name = this.normalizeCategoryName(category);

    const cat = await this.categoryRepository.findOneBy({
      name,
    });

    if (!cat) return [];

    const where: any = {
      categoryId: cat.id,
    };

    // Un vendeur ne voit que ses propres produits dans la catégorie.
    if (requester?.role === 'vendeur') {
      where.userId = requester.id;
    }

    return this.productRepository.find({
      where,
      relations: ['category', 'vendeur'],
    });
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const name = this.normalizeCategoryName(dto.name);

    const exist = await this.categoryRepository.findOneBy({
      name,
    });

    if (exist) {
      throw new ConflictException('Cette catégorie existe déjà');
    }

    const category = this.categoryRepository.create({
      name,
    });

    return this.categoryRepository.save(category);
  }

  async deleteCategory(idOrName: string) {
    const id = Number(idOrName);

    if (!isNaN(id)) {
      await this.categoryRepository.delete({
        id,
      });
    } else {
      await this.categoryRepository.delete({
        name: idOrName,
      });
    }
  }

  async createProduct(
    dto: {
      nom: string;
      prix: string;
      marque?: string;
      description?: string;
      categoryName: string;
      image?: string;
      etat?: string;
      contact?: string;
      email?: string;
      adresse?: string;
      sousCategorie?: string;
    },
    userId: number,
  ) {
    const categoryName = this.normalizeCategoryName(dto.categoryName);

    const cat = await this.categoryRepository.findOneBy({
      name: categoryName,
    });

    if (!cat) {
      throw new ConflictException(
        `Catégorie introuvable : ${dto.categoryName}`,
      );
    }

    const product = this.productRepository.create({
      nom: dto.nom,
      prix: dto.prix,
      marque: dto.marque,
      description: dto.description,
      categoryId: cat.id,
      // Associer le produit au vendeur connecté
      userId: userId,
      // Champs déjà acceptés par le DTO/formulaire mais qui n'étaient
      // pas encore persistés (ils étaient silencieusement ignorés).
      image: dto.image,
      etat: dto.etat,
      contact: dto.contact,
      email: dto.email,
      adresse: dto.adresse,
      sousCategorie: dto.sousCategorie,
    });

    const saved = await this.productRepository.save(product);

    this.logger.log(`Produit ajouté : ${saved.nom}`);

    // NOTE : la notification par e-mail des clients ayant fait une demande
    // correspondante est gérée par le ProductsController
    // via ProductsAvailabilityService -> DemandesAvailabilityService,
    // qui applique le flag `emailNotified` pour éviter les envois en double.

    return saved;
  }

  async deleteProduct(id: number, userId: number, userRole: string) {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      return; // produit déjà supprimé ou inexistant
    }

    // Seul le propriétaire (userId) ou un administrateur peuvent supprimer
    const isAdmin =
      userRole === 'admin_technique' || userRole === 'admin_commercial';
    if (product.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer ce produit.",
      );
    }

    await this.productRepository.delete({
      id,
    });
  }
}
