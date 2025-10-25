import { EntityRepository } from '@/db/entity.repository';
import { Model, ModelDocument } from './entities/model.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model as MongooseModel } from 'mongoose';

export class ModelRepository extends EntityRepository<ModelDocument> {
  constructor(
    @InjectModel(Model.name) phoneModel: MongooseModel<ModelDocument>,
  ) {
    super(phoneModel);
  }
}
