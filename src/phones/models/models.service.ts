import { Injectable, Logger } from '@nestjs/common';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ModelRepository } from './models.repository';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { SlugifyFactory } from '@/utils/generators/slugify.service';
import { BrandsRepository } from '../brands/brands.repository';
import { PipelineStage } from 'mongoose';

@Injectable()
export class ModelsService {
  private readonly logger = new Logger(ModelsService.name);
  constructor(
    private readonly modelRepository: ModelRepository,
    private readonly slugifyFactory: SlugifyFactory,
    private readonly brandsRepository: BrandsRepository,
  ) {}

  async create(createModelDto: CreateModelDto) {
    const existingModel = await this.modelRepository.findOne({
      name: createModelDto.name,
    });

    if (existingModel?.data) {
      this.logger.error('model already exists');
      throw new CustomHttpException(EXCEPTIONS.ALREADY_EXISTS);
    }

    const brandExist = await this.brandsRepository.findOne({
      _id: createModelDto.brand,
    });

    if (!brandExist?.data) {
      this.logger.error('brand not found');
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

  async fields() {
    const brands = await this.brandsRepository.find(
      {},
      { projection: { _id: 1, name: 1 } },
    );

    const data = {
      brands: brands.data,
    };
    return data;
  }

  async findAll(page: number, limit: number, search: string) {
    const pipeline: PipelineStage[] = [
      ...(search
        ? [{ $match: { name: { $regex: search, $options: 'i' } } }]
        : []),
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brand',
          pipeline: [
            {
              $project: {
                _id: 0,
                id: '$_id',
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: '$brand',
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          brand: 1,
          slug: 1,
          release_date: 1,
        },
      },
    ];
    const result = await this.modelRepository.aggregateWithPagination(
      pipeline,
      page,
      limit,
    );

    if (!result.data) {
      this.logger.error('error fetching models');
      throw new CustomHttpException(EXCEPTIONS.SERVER_ERROR);
    }

    return result;
  }

  async update(id: string, updateModelDto: UpdateModelDto) {
    const existingModel = await this.modelRepository.findOne({
      _id: id,
    });

    if (!existingModel?.data) {
      this.logger.error('model not found');
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND);
    }
    let brand;
    if (updateModelDto.brand) {
      brand = await this.brandsRepository.findOne({
        _id: updateModelDto.brand,
      });

      if (!brand?.data) {
        this.logger.error('brand not found');
        throw new CustomHttpException(EXCEPTIONS.NOT_FOUND, 'brand not found');
      }
    }

    const data = {
      ...updateModelDto,
      brand: brand?.data._id,
    };

    return this.modelRepository.updateOne(
      { _id: id },
      {
        $set: data,
      },
    );
  }

  async remove(id: string) {
    return await this.modelRepository.findOneAndDelete({ _id: id });
  }
}
