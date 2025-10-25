import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './users/admins/admins.module';
import { UtilsModule } from './utils/utils.module';
import { BrandsModule } from './phones/brands/brands.module';
import { PartsModule } from './phones/parts/parts.module';
import { ModelsModule } from './phones/models/models.module';
import { CategoriesModule } from './phones/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/environments/.env',
    }),
    DbModule,
    BrandsModule,
    AuthModule,
    AdminsModule,
    UtilsModule,
    PartsModule,
    ModelsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
