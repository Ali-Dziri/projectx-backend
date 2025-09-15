import { Injectable } from '@nestjs/common';
import { CreateDisplayDto } from './dto/create-display.dto';
import { UpdateDisplayDto } from './dto/update-display.dto';

@Injectable()
export class DisplaysService {
  create(createDisplayDto: CreateDisplayDto) {
    return 'This action adds a new display';
  }

  findAll() {
    return `This action returns all displays`;
  }

  findOne(id: number) {
    return `This action returns a #${id} display`;
  }

  update(id: number, updateDisplayDto: UpdateDisplayDto) {
    return `This action updates a #${id} display`;
  }

  remove(id: number) {
    return `This action removes a #${id} display`;
  }
}
