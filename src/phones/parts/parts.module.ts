import { Module } from '@nestjs/common';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Part, PartSchema } from './entities/part.entity';
import { PartsRepository } from './parts.repository';
import { ModelsModule } from '../models/models.module';
import { CategoriesModule } from '../categories/categories.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Part.name, schema: PartSchema }]),
    ModelsModule,
    CategoriesModule,
  ],
  controllers: [PartsController],
  providers: [PartsService, PartsRepository],
})
export class PartsModule {}
