import { EntityRepository } from '@/db/entity.repository';
import { Part, PartDocument } from './entities/part.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class PartsRepository extends EntityRepository<PartDocument> {
  constructor(@InjectModel(Part.name) partModel: Model<PartDocument>) {
    super(partModel);
  }
}
