import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { CustomConfigService } from './modules/custom-config/custom-config.service';
import helmet from 'helmet';
import { CustomValidatorPipe } from './exceptions/custom-validator-pipe';
import { CustomExceptionFilter } from './exceptions/custom-exception-filter';
import { MongooseExceptionFilter } from './exceptions/mongoose-exception-filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CustomLogger } from './config/logger.config';
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get<CustomConfigService>(CustomConfigService);
  const port = configService.get<number>('PORT');
  const apiVersion = configService.get<string>('API_VERSION');
  const whilelist = configService.get<string>('ALLOWED_ORIGINS')?.split(',');
  console.log('whitelist', whilelist);
  app.enableCors({
    origin: whilelist || [],
    // allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.set('trust proxy', 1);
  app.setGlobalPrefix(`api/${apiVersion}`);
  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalPipes(
    new CustomValidatorPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  const adatperHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new MongooseExceptionFilter(adatperHost),
    new CustomExceptionFilter(adatperHost),
  );

  if (!configService.isProd) {
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

  app.useLogger(new CustomLogger());

  const logger = new Logger('Main', { timestamp: true });
  logger.verbose(
    `API started successfully, listening on port ${port}:: -> http://localhost:${port}/api`,
  );
  await app.listen(port ?? 3000);
}
bootstrap();
