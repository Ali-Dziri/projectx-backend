import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePartDto {
  @ApiProperty({ example: 'Engine Oil Filter' })
  @IsString({ message: 'name must be a string' })
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId({ message: 'categoryId is not a valid id' })
  @IsNotEmpty({ message: 'categoryId is required' })
  categoryId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId({ message: 'modelId is not a valid id' })
  @IsNotEmpty({ message: 'modelId is required' })
  modelId: string;

  @ApiPropertyOptional({
    example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
    type: [String],
  })
  @IsArray({ message: 'compatible_models must be an array' })
  @IsMongoId({ each: true, message: 'items must be valid ids' })
  @IsOptional()
  compatible_models?: string[];
}
