import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './categories.repository';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { SlugifyFactory } from '@/utils/generators/slugify.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly slugifyFactory: SlugifyFactory,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoriesRepository.findOne({
      name: createCategoryDto.name,
    });

    if (existingCategory) {
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

  findAll() {
    return `This action returns all categories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const existingCategory = await this.categoriesRepository.findOne({
      _id: id,
    });

    if (!existingCategory) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND);
    }
    return this.categoriesRepository.updateOne(
      { _id: id },
      {
        $set: updateCategoryDto,
      },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
