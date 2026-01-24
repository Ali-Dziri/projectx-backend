import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsOptional()
  website: string;

  @IsString()
  @IsOptional()
  countryOfOrigin: string;
}
