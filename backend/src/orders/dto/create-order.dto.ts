import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * Champs envoyés par le formulaire de commande (Checkout / AjouterCommande)
 * et correspondant aux colonnes de l'entité Order.
 * client/email/telephone/adresse sont optionnels côté requête :
 * ils sont remplis automatiquement depuis le compte de l'utilisateur connecté.
 */
export class CreateOrderDto {
  @IsString()
  @IsOptional()
  client?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  @IsOptional()
  adresse?: string;

  @IsString()
  @IsOptional()
  paiement?: string;

  @IsString()
  @IsNotEmpty()
  produit: string;

  @IsString()
  @IsOptional()
  prix?: string;

  @IsString()
  @IsOptional()
  date?: string;
}
