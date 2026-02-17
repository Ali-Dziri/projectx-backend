import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandsRepository } from './brands.repository';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { BrandDocument } from './entities/brand.entity';
import { PipelineStage } from 'mongoose';
import { Logger } from '@nestjs/common';

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);
  constructor(private readonly brandsRepository: BrandsRepository) {}

  async create(createBrandDto: CreateBrandDto) {
    const existingBrand = await this.brandsRepository.findOne({
      name: createBrandDto.name,
    });
    if (existingBrand) {
      throw new CustomHttpException(EXCEPTIONS.ALREADY_EXISTS);
    }
    return this.brandsRepository.create(createBrandDto);
  }

  async findAll(page: number, limit: number, search: string) {
    const pipeline: PipelineStage[] = [
      ...(search
        ? [{ $match: { name: { $regex: search, $options: 'i' } } }]
        : []),
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          website: 1,
          countryOfOrigin: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    const result =
      await this.brandsRepository.aggregateWithPagination<BrandDocument>(
        pipeline,
        page,
        limit,
      );
    if (!result) {
      this.logger.error('error fetching brands');
      throw new CustomHttpException(EXCEPTIONS.SERVER_ERROR);
    }
    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} brand`;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const existingBrand = await this.brandsRepository.findOne({
      _id: id,
    });

    if (!existingBrand) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND);
    }
    return await this.brandsRepository.updateOne(
      { _id: id },
      {
        $set: updateBrandDto,
      },
    );
  }

  async remove(id: string) {
    const existingBrand = await this.brandsRepository.findOne({
      _id: id,
    });

    if (!existingBrand) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND);
    }
    return await this.brandsRepository.deleteOne({ _id: id });
  }
}
