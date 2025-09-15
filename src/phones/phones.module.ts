import { Module } from '@nestjs/common';
import { PhonesService } from './phones.service';
import { PhonesController } from './phones.controller';
import { DisplaysModule } from './displays/displays.module';
import { BatteriesModule } from './batteries/batteries.module';
import { BrandsModule } from './brands/brands.module';

@Module({
  controllers: [PhonesController],
  providers: [PhonesService],
  imports: [DisplaysModule, BatteriesModule, BrandsModule],
})
export class PhonesModule {}
