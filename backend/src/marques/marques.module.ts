import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Marque } from './marque.entity';
import { MarquesService } from './marques.service';
import { MarquesController } from './marques.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Marque])],
  providers: [MarquesService],
  controllers: [MarquesController],
  exports: [MarquesService],
})
export class MarquesModule {}
