import { Injectable, Logger } from '@nestjs/common';
import { PartsRepository } from '../phones/parts/parts.repository';
import { PartsService } from '../phones/parts/parts.service';
import { PipelineStage } from 'mongoose';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';

@Injectable()
export class WebsiteService {
  private readonly logger = new Logger(WebsiteService.name);
  constructor(
    private readonly partsRepository: PartsRepository,
    private readonly partsService: PartsService,
  ) {}

  async findParts(page: number, limit: number, search: string) {
    return this.partsService.findAll(page, limit, search);
  }

  findOne(id: number) {
    return `This action returns a #${id} website`;
  }
}
