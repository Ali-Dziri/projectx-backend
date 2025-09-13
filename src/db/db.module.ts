import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './db.config';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
  ],
})
export class DbModule {}
