import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { PhonesModule } from './phones/phones.module';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './users/admins/admins.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/environments/.env',
    }),
    DbModule,
    PhonesModule,
    AuthModule,
    AdminsModule,
    UtilsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
