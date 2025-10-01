import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminRepository } from '@/users/admins/admins.repository';
import { AdminAccountStatus } from '@/common/types/users-types';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtPassportStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly adminRepository: AdminRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          if (request && request.cookies) {
            return request.cookies.accessToken as string;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: { email: string; sub: string }) {
    const user = await this.adminRepository.findOne({
      _id: payload.sub,
      email: payload.email,
      accountStatus: AdminAccountStatus.ACTIVE,
    });
    if (!user) {
      throw new CustomHttpException(EXCEPTIONS.UNAUTHORIZED);
    }
    return {
      id: user._id,
      email: user.email,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      phone: user.phone,
      accountStatus: user.accountStatus,
    };
  }
}
