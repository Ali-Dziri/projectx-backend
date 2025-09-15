import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DisplaysService } from './displays.service';
import { CreateDisplayDto } from './dto/create-display.dto';
import { UpdateDisplayDto } from './dto/update-display.dto';

@Controller('displays')
export class DisplaysController {
  constructor(private readonly displaysService: DisplaysService) {}

  @Post()
  create(@Body() createDisplayDto: CreateDisplayDto) {
    return this.displaysService.create(createDisplayDto);
  }

  @Get()
  findAll() {
    return this.displaysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.displaysService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDisplayDto: UpdateDisplayDto) {
    return this.displaysService.update(+id, updateDisplayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.displaysService.remove(+id);
  }
}
