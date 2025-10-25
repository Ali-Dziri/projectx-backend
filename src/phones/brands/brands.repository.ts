import { EntityRepository } from '@/db/entity.repository';
import { Brand, BrandDocument } from './entities/brand.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class BrandsRepository extends EntityRepository<BrandDocument> {
  constructor(@InjectModel(Brand.name) brandsModel: Model<BrandDocument>) {
    super(brandsModel);
  }
}
