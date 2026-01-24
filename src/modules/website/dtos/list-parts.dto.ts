import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsMongoId,
} from 'class-validator';
import { ToStringArray } from '@/common/decorators/transform-array.decorator';

export class ListPartsDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10, { message: 'Limit must be at least 10' })
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  @ToStringArray()
  brands?: string[];

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  @ToStringArray()
  categories?: string[];

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  @ToStringArray()
  models?: string[];
}
