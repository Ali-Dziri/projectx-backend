import { Controller, Get, Query } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { Public } from '../auth/decorators/public.decorator';
import { ListPartsDTO } from './dtos/list-parts.dto';

@Controller('website')
@Public()
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  @Get('parts')
  findAll(@Query() listPartsDto: ListPartsDTO) {
    return this.websiteService.findParts(listPartsDto);
  }

  @Get('fields')
  findOne() {
    return this.websiteService.fields();
  }
}
