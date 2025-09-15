import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  HealthCheck(): Record<string, string> {
    return { health: 'OK' };
  }
}
