import { Injectable, Logger } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { CustomConfigService } from '@/modules/custom-config/custom-config.service';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: CustomConfigService) {}
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
