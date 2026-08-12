import { IsString, MaxLength, MinLength } from 'class-validator';

export class AiSearchDto {
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  query: string;
}
