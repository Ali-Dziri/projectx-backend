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
import { AdminRepository } from './modules/users/admins/admins.repository';
import { Logger } from '@nestjs/common';

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
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly adminRepository: AdminRepository) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*path');
  }

  async onModuleInit() {
    await this._initSuperAdmin();
  }

  private async _initSuperAdmin() {
    const admin = await this.adminRepository.findOne({
      email: process.env.SUPER_ADMIN_EMAIL,
    });

    if (!admin?.data) {
      await this.adminRepository.create({
        firstname: 'admin',
        lastname: 'admin',
        email: 'admin@projectx.com',
        password: 'admin@projectx',
        username: 'adminx',
        phone: {
          code: '*213',
          number: '555555555',
        },
      });
      this.logger.verbose('Super admin created successfully');
    } else {
      this.logger.debug('Super admin already exists, skipping');
    }
  }
}
