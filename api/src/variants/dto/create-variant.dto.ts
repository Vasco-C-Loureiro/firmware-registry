import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateVariantDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  code: string;

  @IsString() @IsOptional()
  description?: string;
}
