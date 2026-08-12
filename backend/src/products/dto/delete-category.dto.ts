import { IsInt, IsOptional, IsString } from 'class-validator';

/**
 * DTO optionnel pour la suppression.
 * (le controller utilise directement @Param, mais ce DTO garde une compatibilité si vous voulez étendre.)
 */
export class DeleteCategoryDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  name?: string;
}
