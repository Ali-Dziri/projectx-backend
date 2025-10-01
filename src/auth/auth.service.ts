import { Injectable } from '@nestjs/common';
import { AdminRepository } from '@/users/admins/admins.repository';
import { AdminDocument } from '@/users/admins/entities/admin.entity';
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
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  private accessTokenOptions: JwtSignOptions = {
    algorithm: 'HS256',
    expiresIn: '15m',
  };
  private refreshTokenOptions: JwtSignOptions = {
    algorithm: 'HS256',
    expiresIn: '7d',
  };
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly codeGenerator: CodeGeneratorService,
  ) {}

  async validateAdmin(
    authCredentials: AuthCredentialsDto,
  ): Promise<AdminDocument> {
    const admin = await this.adminRepository.findOne({
      email: authCredentials.email,
      accountStatus: AdminAccountStatus.ACTIVE,
    });
    if (!admin) {
      throw new CustomHttpException(EXCEPTIONS.USER_NOT_FOUND);
    }
    const isValidPassoword = await bcrypt.compare(
      authCredentials.password,
      admin.password,
    );

    if (!isValidPassoword) {
      throw new CustomHttpException(EXCEPTIONS.PASSWORD_INVALID);
    }
    return admin;
  }

  async login(authCredentials: AuthCredentialsDto): Promise<LoginResponse> {
    const admin = await this.validateAdmin(authCredentials);

    const payload: TokenGenerationPayload = {
      email: admin.email,
      sub: String(admin.id),
    };
    const accessToken = await this.createAccessToken(payload);
    const refreshToken = await this.createRefreshToken(payload);
    const csrfSignature = this.generateCSRFSignature();
    return { accessToken, refreshToken, csrfSignature };
  }

  async refresh(refreshToken: string): Promise<LoginResponse> {
    if (!refreshToken) {
      console.log('not ofund');
      throw new CustomHttpException(EXCEPTIONS.UNAUTHORIZED);
    }
    const extractedPayload: TokenGenerationPayload =
      await this.jwtService.verifyAsync(refreshToken);

    if (!extractedPayload) {
      throw new CustomHttpException(EXCEPTIONS.TOKEN_INVALID);
    }

    const record = await this.refreshTokenRepository.findOne({
      userId: extractedPayload.sub,
    });

    if (!record) {
      throw new CustomHttpException(EXCEPTIONS.TOKEN_INVALID);
    }
    const isSame = await bcrypt.compare(
      refreshToken,
      record.hashedRefreshToken,
    );
    if (!isSame) {
      throw new CustomHttpException(EXCEPTIONS.UNAUTHORIZED);
    }

    if (dayjs(record.expiresIn).isAfter(dayjs())) {
      return {
        accessToken: await this.createAccessToken(extractedPayload),
        refreshToken,
        csrfSignature: this.generateCSRFSignature(),
      };
    }

    await this.refreshTokenRepository.deleteOne({
      _id: record._id,
    });

    const newRefreshToken = await this.createRefreshToken(extractedPayload);
    const newAccessToken = await this.createAccessToken(extractedPayload);
    const csrfSignature = this.generateCSRFSignature();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      csrfSignature,
    };
  }

  async logout(refreshToken: string): Promise<boolean> {
    const extractedPayload: TokenGenerationPayload =
      await this.jwtService.verifyAsync(refreshToken);
    if (!extractedPayload) {
      throw new CustomHttpException(EXCEPTIONS.TOKEN_INVALID);
    }
    const result = await this.refreshTokenRepository.deleteOne({
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

  private generateCSRFSignature() {
    return this.codeGenerator
      .csrfFactory()
      .withRandomBytes(16, 'hex')
      .withRandomUUID()
      .build();
  }
}
