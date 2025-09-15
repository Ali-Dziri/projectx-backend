import { Module } from '@nestjs/common';
import { BatteriesService } from './batteries.service';
import { BatteriesController } from './batteries.controller';

@Module({
  controllers: [BatteriesController],
  providers: [BatteriesService],
})
export class BatteriesModule {}
