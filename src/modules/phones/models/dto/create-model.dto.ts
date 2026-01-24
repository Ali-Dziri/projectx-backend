import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModelDto {
  @ApiProperty({ example: 'iPhone 12' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsMongoId()
  brand: string;

  @ApiProperty({ example: '2020-01-01' })
  @IsOptional()
  @IsDate()
  release_date: Date;
}
