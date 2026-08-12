import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiService } from './ai.service';
import { AiController } from './ai.controller';

import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Demande } from '../demandes/demande.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Demande])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
