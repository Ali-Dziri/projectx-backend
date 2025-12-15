import { Module } from '@nestjs/common';
import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';
import { ModelRepository } from './models.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Model, ModelSchema } from './entities/model.entity';
import { BrandsModule } from '../brands/brands.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Model.name, schema: ModelSchema }]),
    BrandsModule,
  ],
  controllers: [ModelsController],
  providers: [ModelsService, ModelRepository],
  exports: [ModelRepository],
})
export class ModelsModule {}
