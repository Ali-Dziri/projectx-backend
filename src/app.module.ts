import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomConfigModule } from './modules/custom-config/custom-config.module';
import { CustomConfigService } from './modules/custom-config/custom-config.service';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   envFilePath: 'src/environments/.env',
    // }),
    CustomConfigModule,
    DbModule,
    BrandsModule,
    AuthModule,
    AdminsModule,
    UtilsModule,
    PartsModule,
    ModelsModule,
    CategoriesModule,
    WebsiteModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly config: CustomConfigService,
  ) {}

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

    if (!admin) {
      await this.adminRepository.create({
        firstname: 'admin',
        lastname: 'admin',
        email: this.config.get<string>('SUPER_ADMIN_EMAIL'),
        password: this.config.get<string>('SUPER_ADMIN_PASSWORD'),
        username: this.config.get<string>('SUPER_ADMIN_USERNAME'),
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
