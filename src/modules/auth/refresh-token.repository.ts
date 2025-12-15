import {
  RefreshToken,
  RefreshTokenDocument,
} from './entities/refresh-token.entity';
import { InjectModel } from '@nestjs/mongoose';
import { EntityRepository } from '@/db/entity.repository';
import { Model } from 'mongoose';

export class RefreshTokenRepository extends EntityRepository<RefreshTokenDocument> {
  constructor(
    @InjectModel(RefreshToken.name) model: Model<RefreshTokenDocument>,
  ) {
    super(model);
  }
}
