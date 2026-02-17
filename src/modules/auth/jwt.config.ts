import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { CustomConfigService } from '../custom-config/custom-config.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private readonly configService: CustomConfigService) {}
  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.configService.get<string>('JWT_SECRET'),
    };
  }
}
