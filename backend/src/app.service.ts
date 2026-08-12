import { Injectable, NotFoundException } from '@nestjs/common';

export interface Company {
  nom: string;
  secteur: string;
  logo?: string;
}

@Injectable()
export class AppService {
  private readonly companies: Company[] = [
    { nom: 'Toyota', secteur: 'Automobile', logo: 'Toyota' },
    { nom: 'Bosch', secteur: 'Électronique', logo: 'Bosch' },
    { nom: 'Ford', secteur: 'Automobile', logo: 'Ford' },
    { nom: 'Nissan', secteur: 'Automobile', logo: 'Nissan' },
    { nom: 'Honda', secteur: 'Automobile', logo: 'Honda' },
    { nom: 'BMW', secteur: 'Automobile', logo: 'BMW' },
    { nom: 'Renault', secteur: 'Automobile', logo: 'Renault' },
    { nom: 'Peugeot', secteur: 'Automobile', logo: 'Peugeot' },
    { nom: 'Valeo', secteur: 'Pièces auto', logo: 'Valeo' },
    { nom: 'TotalEnergies', secteur: 'Énergie', logo: 'TotalEnergies' },
  ];

  getHello(): string {
    return 'Hello World!';
  }

  getCompanies(): Company[] {
    return this.companies;
  }

  getCompany(name: string): Company {
    const company = this.companies.find(
      (c) => c.nom.toLowerCase() === decodeURIComponent(name).toLowerCase(),
    );
    if (!company) {
      throw new NotFoundException(`Entreprise '${name}' introuvable`);
    }
    return company;
  }
}
