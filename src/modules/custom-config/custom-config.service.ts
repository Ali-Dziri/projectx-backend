import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env.shema';

@Injectable()
export class CustomConfigService extends ConfigService<Env, true> {
  get isProd() {
    return this.get('NODE_ENV') === 'prod';
  }

  get port() {
    return this.get<number>('PORT');
  }
}
