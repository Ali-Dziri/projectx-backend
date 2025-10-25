import { Injectable } from '@nestjs/common';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ModelRepository } from './models.repository';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { ModelDocument } from './entities/model.entity';
import { SlugifyFactory } from '@/utils/generators/slugify.service';
import { BrandsRepository } from '../brands/brands.repository';
@Injectable()
export class ModelsService {
  constructor(
    private readonly modelRepository: ModelRepository,
    private readonly slugifyFactory: SlugifyFactory,
    private readonly brandsRepository: BrandsRepository,
  ) {}

  async create(createModelDto: CreateModelDto): Promise<ModelDocument> {
    const existingModel = await this.modelRepository.findOne({
      name: createModelDto.name,
    });

    if (existingModel) {
      throw new CustomHttpException(EXCEPTIONS.ALREADY_EXISTS);
    }

    const brandExist = await this.brandsRepository.findOne({
      _id: createModelDto.brand,
    });

    if (!brandExist) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND, 'brand not found');
    }

    const slug = this.slugifyFactory
      .WithDefaultOption(createModelDto.name)
      .build();

    return await this.modelRepository.create({
      ...createModelDto,
      slug,
    });
  }

  findAll() {
    return `This action returns all models`;
  }

  findOne(id: number) {
    return `This action returns a #${id} model`;
  }

  async update(id: string, updateModelDto: UpdateModelDto) {
    const existingModel = await this.modelRepository.findOne({
      _id: id,
    });

    if (!existingModel) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND);
    }
    return this.modelRepository.updateOne(
      { _id: id },
      {
        $set: updateModelDto,
      },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} model`;
  }
}
