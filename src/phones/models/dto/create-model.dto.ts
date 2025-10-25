import { IsDateString, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateModelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsMongoId()
  brand: string;

  @IsNotEmpty()
  @IsDateString()
  release_date: Date;
}
