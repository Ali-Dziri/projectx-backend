import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { CustomValidatorPipe } from './exceptions/custom-validator-pipe';
import { CustomExceptionFilter } from './exceptions/custom-exception-filter';
import { MongooseExceptionFilter } from './exceptions/mongoose-exception-filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<number>('PORT');
  const apiVersion = configService.get<string>('API_VERSION');

  app.set('trust proxy', 1);
  app.setGlobalPrefix(`api/${apiVersion}`);
  app.use(helmet());
  app.useGlobalPipes(
    new CustomValidatorPipe({ transform: true, whitelist: true }),
  );
  const adatperHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new MongooseExceptionFilter(adatperHost),
    new CustomExceptionFilter(adatperHost),
  );

  if (configService.get<string>('NODE_ENV') === 'dev') {
    const config = new DocumentBuilder()
      .setTitle('Project X')
      .setDescription('API documentation for Project X')
      .setVersion(`${apiVersion}`)
      .build();
    const documentFactory = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory, {
      customSiteTitle: 'Project X',
    });
  }

  const logger = new Logger('Main');
  logger.verbose(
    `API started successfully, listening on port ${port}:: -> http://localhost:${port}/api`,
  );
  await app.listen(port ?? 3000);
}
bootstrap();
