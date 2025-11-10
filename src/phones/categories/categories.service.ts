import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './categories.repository';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { SlugifyFactory } from '@/utils/generators/slugify.service';
import { PipelineStage } from 'mongoose';
import { Logger } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly slugifyFactory: SlugifyFactory,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoriesRepository.findOne({
      name: createCategoryDto.name,
    });

    if (existingCategory?.data) {
      this.logger.error('category already exists');
      throw new CustomHttpException(EXCEPTIONS.ALREADY_EXISTS);
    }
    const slug = this.slugifyFactory
      .WithDefaultOption(createCategoryDto.name)
      .build();
    return this.categoriesRepository.create({
      ...createCategoryDto,
      slug,
    });
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
          description: 1,
          slug: 1,
        },
      },
    ];
    const result = await this.categoriesRepository.aggregateWithPagination(
      pipeline,
      page,
      limit,
    );

    if (!result) {
      this.logger.error('error fetching categories');
      throw new CustomHttpException(EXCEPTIONS.SERVER_ERROR);
    }
    return result;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const existingCategory = await this.categoriesRepository.findOne({
      _id: id,
    });

    if (!existingCategory) {
      this.logger.error('category not found');
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND);
    }
    return this.categoriesRepository.updateOne(
      { _id: id },
      {
        $set: updateCategoryDto,
      },
    );
  }

  async remove(id: string) {
    const category = await this.categoriesRepository.findOne({ _id: id });
    if (!category?.data) {
      this.logger.error('category not found');
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND);
    }
    return this.categoriesRepository.deleteOne({ _id: id });
  }
}
