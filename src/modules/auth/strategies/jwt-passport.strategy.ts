import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomConfigService } from '@/modules/custom-config/custom-config.service';
import { AdminRepository } from '@/modules/users/admins/admins.repository';
import { AdminAccountStatus } from '@/common/types/users-types';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { UserType } from '@/common/types/users-types';

@Injectable()
export class JwtPassportStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly CustomConfigService: CustomConfigService,
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
      secretOrKey: CustomConfigService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { email: string; sub: string }): Promise<UserType> {
    const result = await this.adminRepository.findOne({
      _id: payload.sub,
      email: payload.email,
      accountStatus: AdminAccountStatus.ACTIVE,
    });
    if (!result) {
      throw new CustomHttpException(EXCEPTIONS.UNAUTHORIZED);
    }
    const user = result;
    return {
      id: String(user._id),
      email: user.email,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      phone: user.phone,
    };
  }
}
