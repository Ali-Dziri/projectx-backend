import { Injectable, Logger } from '@nestjs/common';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartsRepository } from './parts.repository';
import { CodeGeneratorService } from '@/utils/generators/code-generators.service';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { SlugifyFactory } from '@/utils/generators/slugify.service';
import { ModelRepository } from '../models/models.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { PipelineStage } from 'mongoose';
@Injectable()
export class PartsService {
  private readonly logger = new Logger(PartsService.name);
  constructor(
    private readonly partsRepository: PartsRepository,
    private readonly codeGenerator: CodeGeneratorService,
    private readonly slugifyFactory: SlugifyFactory,
    private readonly modelRepository: ModelRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(createPartDto: CreatePartDto) {
    const modelExist = await this.modelRepository.findOne({
      _id: createPartDto.modelId,
    });

    if (!modelExist?.data) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND, 'model not found');
    }

    const model = modelExist.data;

    const recordExist = await this.categoriesRepository.findOne({
      _id: createPartDto.categoryId,
    });

    if (!recordExist?.data) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND, 'category not found');
    }

    const category = recordExist.data;

    const name = createPartDto.name
      ? createPartDto.name
      : `${category.name}_${model.name}`;

    const slugifiedName = this.slugifyFactory
      .withText(name)
      .withLowerCase()
      .withReplaceSpacesWithUnderscore()
      .withRemoveNonWordChars()
      .build();

    const reference = this.codeGenerator
      .codeFactory()
      .withLength(12)
      .withType('ALPHANUMERIC')
      .withPrefix(slugifiedName)
      .build();

    const createdPart = await this.partsRepository.create({
      ...createPartDto,
      name,
      reference,
    });

    if (!createdPart) {
      throw new CustomHttpException(EXCEPTIONS.SERVER_ERROR);
    }
    return createdPart;
  }

  async fields() {
    const promise1 = this.modelRepository.find(
      {},
      { projection: { _id: 1, name: 1 } },
    );
    const promise2 = this.categoriesRepository.find(
      {},
      { projection: { _id: 1, name: 1 } },
    );
    const [models, categories] = await Promise.all([promise1, promise2]);

    if (!models || !categories) {
      this.logger.error('error fetching fields');
      throw new CustomHttpException(EXCEPTIONS.SERVER_ERROR);
    }

    const data = {
      models: models.data,
      categories: categories.data,
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
          from: 'models',
          localField: 'modelId',
          foreignField: '_id',
          as: 'model',
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
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
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
        $lookup: {
          from: 'models',
          localField: 'compatible_models',
          foreignField: '_id',
          as: 'compatible_models',
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
        $unwind: '$model',
      },
      {
        $unwind: '$category',
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          model: '$model',
          category: '$category',
          compatible_models: '$compatible_models',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];
    const result = await this.partsRepository.aggregateWithPagination(
      pipeline,
      page,
      limit,
    );

    if (!result) {
      this.logger.error('error fetching parts');
      throw new CustomHttpException(EXCEPTIONS.SERVER_ERROR);
    }
    return result;
  }

  async update(id: string, updatePartDto: UpdatePartDto) {
    const existingPart = await this.partsRepository.findOne({
      _id: id,
    });

    if (!existingPart?.data) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND);
    }
    return await this.partsRepository.updateOne(
      { _id: id },
      {
        $set: updatePartDto,
      },
    );
  }

  async remove(id: string) {
    const existingPart = await this.partsRepository.findOne({ _id: id });

    if (!existingPart?.data) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND);
    }
    return await this.partsRepository.deleteOne({ _id: id });
  }
}
