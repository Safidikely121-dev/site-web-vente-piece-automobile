import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMarqueDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsOptional()
  @IsString()
  logo?: string;
}
