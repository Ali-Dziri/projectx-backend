import { Injectable, Logger } from '@nestjs/common';
import { PartsRepository } from '../phones/parts/parts.repository';
import { CategoriesRepository } from '../phones/categories/categories.repository';
import { BrandsRepository } from '../phones/brands/brands.repository';
import { ModelRepository } from '../phones/models/models.repository';
import mongoose, { PipelineStage } from 'mongoose';
import { ListPartsDTO } from './dtos/list-parts.dto';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';

@Injectable()
export class WebsiteService {
  private readonly logger = new Logger(WebsiteService.name);
  constructor(
    private readonly partsRepository: PartsRepository,
    private readonly categoryRepository: CategoriesRepository,
    private readonly brandsRepository: BrandsRepository,
    private readonly ModelsRepository: ModelRepository,
  ) {}

  async findParts(listPartsDto: ListPartsDTO) {
    const categories =
      listPartsDto.categories && listPartsDto.categories.length > 0
        ? listPartsDto.categories?.map((id) => new mongoose.Types.ObjectId(id))
        : [];
    const brands =
      listPartsDto.brands && listPartsDto.brands.length > 0
        ? listPartsDto.brands?.map((id) => new mongoose.Types.ObjectId(id))
        : [];
    const models =
      listPartsDto.models && listPartsDto.models.length > 0
        ? listPartsDto.models?.map((id) => new mongoose.Types.ObjectId(id))
        : [];
    const pipeline: PipelineStage[] = [
      ...(listPartsDto.search
        ? [{ $match: { name: { $regex: listPartsDto.search, $options: 'i' } } }]
        : []),
      ...(categories.length > 0
        ? [{ $match: { categoryId: { $in: categories } } }]
        : []),
      ...(models.length > 0 ? [{ $match: { modelId: { $in: models } } }] : []),
      {
        $lookup: {
          from: 'models',
          localField: 'modelId',
          foreignField: '_id',
          as: 'model',
          pipeline: [
            ...(brands.length > 0
              ? [{ $match: { brand: { $in: brands } } }]
              : []),
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
      listPartsDto.page,
      listPartsDto.limit,
    );
    if (!result) {
      this.logger.error('error fetching parts');
      throw new CustomHttpException(EXCEPTIONS.SERVER_ERROR);
    }
    return result;
  }

  async fields() {
    const categories = await this.categoryRepository.find(
      {},
      {
        projection: { id: 1, name: 1 },
      },
    );
    const brands = await this.brandsRepository.find(
      {},
      {
        projection: { id: 1, name: 1 },
      },
    );
    const models = await this.ModelsRepository.find(
      {},
      {
        projection: { id: 1, name: 1 },
      },
    );

    return {
      categories: categories || [],
      brands: brands || [],
      models: models || [],
    };
  }
}
