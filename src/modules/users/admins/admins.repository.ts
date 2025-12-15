import { Model } from 'mongoose';
import { Admin, AdminDocument } from './entities/admin.entity';
import { InjectModel } from '@nestjs/mongoose';
import { EntityRepository } from '@/db/entity.repository';

export class AdminRepository extends EntityRepository<AdminDocument> {
  constructor(@InjectModel(Admin.name) adminModel: Model<AdminDocument>) {
    super(adminModel);
  }
}
