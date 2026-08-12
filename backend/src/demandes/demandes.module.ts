import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandesController } from './demandes.controller';
import { DemandesService } from './demandes.service';
import { Demande } from './demande.entity';
import { DemandesAvailabilityService } from './demandes-availability.service';
import { DemandesVendorNotifyService } from './demandes-vendor-notify.service';
import { User } from '../entities/user.entity';
import { EmailModule } from '../email/email.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Demande, User]), EmailModule, AiModule],
  providers: [
    DemandesService,
    DemandesAvailabilityService,
    DemandesVendorNotifyService,
  ],
  controllers: [DemandesController],
  exports: [DemandesAvailabilityService, DemandesVendorNotifyService],
})
export class DemandesModule {}
