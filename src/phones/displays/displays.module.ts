import { Module } from '@nestjs/common';
import { DisplaysService } from './displays.service';
import { DisplaysController } from './displays.controller';

@Module({
  controllers: [DisplaysController],
  providers: [DisplaysService],
})
export class DisplaysModule {}
