import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { DemandesAvailabilityService } from '../demandes/demandes-availability.service';

@Injectable()
export class ProductsAvailabilityService {
  private readonly logger = new Logger(ProductsAvailabilityService.name);
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly demandesAvailabilityService: DemandesAvailabilityService,
  ) {}

  async notifyClientsForProduct(productId: number) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['category'],
    });
    if (!product) return;

    // Récupérer le nom de la catégorie (via la relation ou une requête séparée)
    let categoryName: string | undefined;
    if (product.category?.name) {
      categoryName = product.category.name;
    } else if (product.categoryId) {
      const cat = await this.categoryRepository.findOneBy({
        id: product.categoryId,
      });
      categoryName = cat?.name;
    }

    await this.demandesAvailabilityService.notifyClientsWhenProductAvailable({
      produit: product.nom,
      categorie: categoryName,
      marque: product.marque,
    });

    this.logger.log(
      `Notification déclenchée pour le produit #${productId} : "${product.nom}"`,
    );
  }
}
