import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<number>('PORT');

  app.set('trust proxy', 1);
  app.setGlobalPrefix('api/v1');
  const logger = new Logger('Main');
  logger.verbose(
    `API started successfully, listening on port ${port}:: -> http://localhost:${port}/api/v1`,
  );
  await app.listen(port ?? 3000);
}
bootstrap();
