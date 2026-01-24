import { Module } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { WebsiteController } from './website.controller';
import { PartsModule } from '../phones/parts/parts.module';
import { CategoriesModule } from '../phones/categories/categories.module';
import { BrandsModule } from '../phones/brands/brands.module';
import { ModelsModule } from '../phones/models/models.module';

@Module({
  imports: [PartsModule, CategoriesModule, BrandsModule, ModelsModule],
  controllers: [WebsiteController],
  providers: [WebsiteService],
})
export class WebsiteModule {}
