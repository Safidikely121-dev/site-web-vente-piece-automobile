import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateDescriptionDto {
  @IsString()
  @MaxLength(150)
  nom: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  marque?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  categorie?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  etat?: string;
}
