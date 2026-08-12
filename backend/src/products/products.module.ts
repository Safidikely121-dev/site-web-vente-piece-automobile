import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsAvailabilityService } from './products-availability.service';

import {
  ProductsController,
  CategoriesController,
} from './products.controller';

import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';

import { DemandesModule } from '../demandes/demandes.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),

    DemandesModule,
    EmailModule,
  ],

  providers: [ProductsService, ProductsAvailabilityService],

  controllers: [ProductsController, CategoriesController],

  exports: [ProductsService],
})
export class ProductsModule {}
