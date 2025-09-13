import { Injectable, Logger } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.get<string>('DB_URI'),
      dbName: this.configService.get<string>('DB_NAME'),
      retryAttempts: 5,
      retryDelay: 5000,
      onConnectionCreate(connection) {
        connection.on('connected', () => {
          const logger = new Logger(MongooseConfigService.name);
          logger.log('Successfully connected to database');
        });
      },
    };
  }
}
