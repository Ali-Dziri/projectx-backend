import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminsModule } from '@/modules/users/admins/admins.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from './jwt.config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './refresh-token.repository';
import { JwtPassportStrategy } from './strategies/jwt-passport.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { CSRFTokenGuard } from './guards/csrf-token.guard';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    AdminsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenRepository,
    JwtPassportStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: CSRFTokenGuard },
  ],
})
export class AuthModule {}
