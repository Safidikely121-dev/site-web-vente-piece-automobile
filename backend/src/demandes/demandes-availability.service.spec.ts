import { Test, TestingModule } from '@nestjs/testing';
import { DemandesAvailabilityService } from './demandes-availability.service';
import { Demande } from './demande.entity';
import { EmailService } from '../email/email.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('DemandesAvailabilityService', () => {
  let service: DemandesAvailabilityService;
  let demandeRepository: { find: jest.Mock; save: jest.Mock };
  let emailService: { sendProductAvailableEmail: jest.Mock };

  beforeEach(async () => {
    demandeRepository = {
      find: jest.fn(),
      save: jest.fn(),
    };

    emailService = {
      sendProductAvailableEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemandesAvailabilityService,
        {
          provide: getRepositoryToken(Demande),
          useValue: demandeRepository,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
      ],
    }).compile();

    service = module.get<DemandesAvailabilityService>(
      DemandesAvailabilityService,
    );
  });

  it('should notify a client when the requested product matches even if the demand has no category', async () => {
    demandeRepository.find.mockResolvedValue([
      {
        id: 1,
        email: 'client@example.com',
        nom: 'Client Test',
        produit: 'Filtre à huile',
        categorie: '',
        description: '',
        emailNotified: false,
      },
    ]);

    await service.notifyClientsWhenProductAvailable({
      produit: 'Filtre à huile',
      categorie: 'Moteur',
    });

    expect(emailService.sendProductAvailableEmail).toHaveBeenCalledWith({
      to: 'client@example.com',
      clientName: 'Client Test',
      productName: 'Filtre à huile',
    });
  });
});
