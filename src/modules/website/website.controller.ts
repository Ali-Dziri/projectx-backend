import { Controller, Get, Param, Query } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('website')
@Public()
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  @Get('parts')
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return this.websiteService.findParts(page, limit, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.websiteService.findOne(+id);
  }
}
