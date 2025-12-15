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
import {
  TokenGenerationPayload,
  LoginResponse,
} from '@/common/types/auth-types';
import { CodeGeneratorService } from '@/utils/generators/code-generators.service';
import dayjs from 'dayjs';
import { Logger } from '@nestjs/common';

type RefreshResponse = LoginResponse & {
  newRefresh: boolean;
};

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

  async login(authCredentials: AuthCredentialsDto): Promise<RefreshResponse> {
    const admin = await this.validateAdmin(authCredentials);

    if (!admin) {
      throw new CustomHttpException(EXCEPTIONS.USER_NOT_FOUND);
    }

    const existingRefreshToken = await this.refreshTokenRepository.findOne({
      userId: admin.id,
    });

    const payload: TokenGenerationPayload = {
      email: admin.email,
      sub: String(admin.id),
    };
    if (!existingRefreshToken?.data) {
      const accessToken = await this.createAccessToken(payload);
      const refreshToken = await this.createRefreshToken(payload);
      const csrfToken = this.generateCSRFToken();
      return { accessToken, refreshToken, csrfToken, newRefresh: true };
    }

    const validRefreshToken = dayjs(
      existingRefreshToken.data.expiresIn,
    ).isAfter(dayjs());

    if (validRefreshToken) {
      const accessToken = await this.createAccessToken(payload);
      const csrfToken = this.generateCSRFToken();
      return { accessToken, csrfToken, newRefresh: false };
    } else {
      const accessToken = await this.createAccessToken(payload);
      const refreshToken = await this.createRefreshToken(payload);
      const csrfToken = this.generateCSRFToken();
      return { accessToken, refreshToken, csrfToken, newRefresh: true };
    }
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
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
      throw new CustomHttpException(EXCEPTIONS.TOKEN_INVALID);
    }

    const result = await this.refreshTokenRepository.findOne({
      userId: extractedPayload.sub,
    });

    if (!result) {
      this.logger.error('refresh token not found in db');
      throw new CustomHttpException(EXCEPTIONS.TOKEN_INVALID);
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
      return {
        accessToken: await this.createAccessToken(cleanPayload),
        refreshToken,
        csrfToken: this.generateCSRFToken(),
        newRefresh: false,
      };
    }

    await this.refreshTokenRepository.deleteOne({
      _id: record._id,
    });

    const newRefreshToken = await this.createRefreshToken(cleanPayload);
    const newAccessToken = await this.createAccessToken(cleanPayload);
    const csrfToken = this.generateCSRFToken();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      csrfToken,
      newRefresh: true,
    };
  }

  async logout(refreshToken: string): Promise<boolean> {
    const extractedPayload: TokenGenerationPayload =
      await this.jwtService.verifyAsync(refreshToken);
    if (!extractedPayload) {
      throw new CustomHttpException(EXCEPTIONS.TOKEN_INVALID);
    }
    const result = await this.refreshTokenRepository.deleteMany({
      userId: extractedPayload.sub,
    });
    if (result.deletedCount === 0) {
      return false;
    }
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
