import { Injectable } from '@nestjs/common';
import { AdminRepository } from '@/modules/users/admins/admins.repository';
import { AdminDocument } from '@/modules/users/admins/entities/admin.entity';
import bcrypt from 'bcryptjs';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { RefreshTokenRepository } from './refresh-token.repository';
import { AdminAccountStatus } from '@/common/types/users-types';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { TokenGenerationPayload } from '@/common/types/auth-types';
import { CodeGeneratorService } from '@/utils/generators/code-generators.service';
import dayjs from 'dayjs';
import { Logger } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private accessTokenOptions: JwtSignOptions = {
    algorithm: 'HS256',
    expiresIn: '15M',
  };
  private refreshTokenOptions: JwtSignOptions = {
    algorithm: 'HS256',
    expiresIn: '7d',
  };
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly codeGenerator: CodeGeneratorService,
    private readonly configService: ConfigService,
  ) {}

  async validateAdmin(
    authCredentials: AuthCredentialsDto,
  ): Promise<AdminDocument> {
    const result = await this.adminRepository.findOne({
      email: authCredentials.email,
      accountStatus: AdminAccountStatus.ACTIVE,
    });
    if (!result) {
      throw new CustomHttpException(EXCEPTIONS.USER_NOT_FOUND);
    }

    const admin = result.data;

    const isValidPassoword = await bcrypt.compare(
      authCredentials.password,
      admin.password,
    );

    if (!isValidPassoword) {
      throw new CustomHttpException(EXCEPTIONS.PASSWORD_INVALID);
    }
    return admin;
  }

  async login(
    authCredentials: AuthCredentialsDto,
    response: Response,
  ): Promise<{ csrfToken: string }> {
    const admin = await this.validateAdmin(authCredentials);

    if (!admin) {
      throw new CustomHttpException(EXCEPTIONS.USER_NOT_FOUND);
    }

    await this.refreshTokenRepository.deleteMany({
      userId: admin.id,
    });

    const payload: TokenGenerationPayload = {
      email: admin.email,
      sub: String(admin.id),
    };

    const accessToken = await this.createAccessToken(payload);
    const refreshToken = await this.createRefreshToken(payload);
    const csrfToken = this.generateCSRFToken();

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      maxAge: this.configService.get<number>('REFRESH_TOKEN_MAX_AGE'),
      sameSite: 'lax',
    });
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_MAX_AGE'),
      sameSite: 'lax',
    });
    response.cookie('csrfToken', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'lax',
    });

    return { csrfToken };
  }

  async refresh(
    refreshToken: string,
    response: Response,
  ): Promise<{ csrfToken: string }> {
    if (!refreshToken) {
      this.logger.error('refresh token not found');
      throw new CustomHttpException(EXCEPTIONS.UNAUTHORIZED);
    }

    const extractedPayload: TokenGenerationPayload =
      await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

    if (!extractedPayload) {
      this.logger.error('error decoding token');
      throw new CustomHttpException(EXCEPTIONS.UNAUTHORIZED);
    }

    const result = await this.refreshTokenRepository.findOne({
      userId: extractedPayload.sub,
    });

    if (!result) {
      this.logger.error('refresh token not found in db');
      response.clearCookie('refreshToken');
      response.clearCookie('accessToken');
      response.clearCookie('csrfToken');
      throw new CustomHttpException(EXCEPTIONS.UNAUTHORIZED);
    }

    const record = result.data;

    const isSame = await bcrypt.compare(
      refreshToken,
      record.hashedRefreshToken,
    );

    if (!isSame) {
      this.logger.error('refresh is not valid');
      throw new CustomHttpException(EXCEPTIONS.UNAUTHORIZED);
    }

    const cleanPayload: TokenGenerationPayload = {
      sub: extractedPayload.sub,
      email: extractedPayload.email,
    };

    if (dayjs(record.expiresIn).isAfter(dayjs())) {
      const accessToken = await this.createAccessToken(cleanPayload);
      const csrfToken = this.generateCSRFToken();
      response.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'prod',
        maxAge: this.configService.get<number>('ACCESS_TOKEN_MAX_AGE'),
        sameSite: 'lax',
      });
      response.cookie('csrfToken', csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'prod',
        sameSite: 'lax',
      });
      return { csrfToken };
    }

    await this.refreshTokenRepository.deleteOne({
      _id: record._id,
    });

    const newRefreshToken = await this.createRefreshToken(cleanPayload);
    const newAccessToken = await this.createAccessToken(cleanPayload);
    const csrfToken = this.generateCSRFToken();

    response.clearCookie('refreshToken');
    response.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      maxAge: this.configService.get<number>('REFRESH_TOKEN_MAX_AGE'),
      sameSite: 'lax',
    });
    response.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_MAX_AGE'),
      sameSite: 'lax',
    });
    response.cookie('csrfToken', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'lax',
    });
    return { csrfToken };
  }

  async logout(refreshToken: string, response: Response): Promise<boolean> {
    if (refreshToken) {
      const extractedPayload: TokenGenerationPayload =
        await this.jwtService.verifyAsync(refreshToken);

      if (!extractedPayload) {
        this.logger.error('error decoding token');
      }
      const result = await this.refreshTokenRepository.deleteMany({
        userId: extractedPayload.sub,
      });

      if (result.deletedCount === 0) {
        this.logger.warn('refresh token not found in db');
      }
    }

    response.clearCookie('refreshToken');
    response.clearCookie('accessToken');
    response.clearCookie('csrfToken');
    return true;
  }

  private async createRefreshToken(payload: TokenGenerationPayload) {
    const token = await this.jwtService.signAsync(
      payload,
      this.refreshTokenOptions,
    );
    const hashedToken = await bcrypt.hash(token, 12);
    await this.refreshTokenRepository.create({
      hashedRefreshToken: hashedToken,
      userId: payload.sub,
      expiresIn: dayjs().add(7, 'day').toDate(),
    });
    return token;
  }

  private async createAccessToken(payload: TokenGenerationPayload) {
    const token = await this.jwtService.signAsync(
      payload,
      this.accessTokenOptions,
    );
    return token;
  }

  private generateCSRFToken() {
    return this.codeGenerator
      .csrfFactory()
      .withRandomBytes(16, 'hex')
      .withRandomUUID()
      .build();
  }
}
