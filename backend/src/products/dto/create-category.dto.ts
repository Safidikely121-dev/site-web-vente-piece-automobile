import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

/**
 * DTO utilisé pour la création d'une nouvelle catégorie.
 */
export class CreateCategoryDto {
  /** Nom de la catégorie. */
  @IsString()
  @MinLength(2)
  name: string;

  /**
   * Image (URL) optionnelle.
   * Note : class-validator utilise une URL valide.
   */
  @IsOptional()
  @IsString()
  @IsUrl()
  image?: string;
}
