import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminsModule } from './modules/users/admins/admins.module';
import { UtilsModule } from './utils/utils.module';
import { BrandsModule } from './modules/phones/brands/brands.module';
import { PartsModule } from './modules/phones/parts/parts.module';
import { ModelsModule } from './modules/phones/models/models.module';
import { CategoriesModule } from './modules/phones/categories/categories.module';
import { HttpMiddleware } from './middlewares/http.middleware';
import { WebsiteModule } from './modules/website/website.module';
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
    WebsiteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*path');
  }
}
