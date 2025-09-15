import { Logger } from '@nestjs/common';
import {
  AggregateOptions,
  ClientSession,
  Document,
  FilterQuery,
  Model,
  MongooseBulkWriteOptions,
  PipelineStage,
  PopulateOptions,
  SaveOptions,
  UpdateQuery,
} from 'mongoose';
import { CustomHttpException } from 'src/exceptions/custom-http-exception';
import { EXCEPTIONS } from 'src/exceptions/exceptions-list';
import { Options, PaginationType, AggregationPaginationResult } from './types';

export abstract class EntityRepository<T extends Document> {
  protected readonly logger = new Logger(EntityRepository.name);
  protected constructor(protected entityModel: Model<T>) {}

  async findOne(filter: FilterQuery<T>, options?: Options) {
    const { sort, projection, populate, limit } = options || {};
    let query = this.entityModel.findOne(filter, {
      ...projection,
    });
    if (sort) {
      query = query.sort(sort);
    }
    if (limit) {
      query = query.limit(limit);
    }
    if (populate) {
      query.populate(populate);
    }
    return query.exec();
  }

  async find(filter: FilterQuery<T>, options?: Options) {
    const { sort, projection, populate, skip, limit, lean } = options || {};
    const query = this.entityModel.find(filter, { ...projection });
    if (sort) query.sort(sort);
    if (populate) query.populate(populate);
    if (skip) query.skip(skip);
    if (limit) query.limit(limit);
    if (lean) query.lean();
    return query.exec();
  }

  async create(createEntityData: unknown, options?: SaveOptions) {
    const entity = new this.entityModel(createEntityData);
    return entity.save(options);
  }

  async updateOne(
    filter: FilterQuery<T>,
    updateEntityData: UpdateQuery<T>,
    populate?: PopulateOptions,
    session?: ClientSession,
  ) {
    return this.entityModel.updateOne(filter, updateEntityData, {
      populate,
      session,
    });
  }

  async insertMany(entitiesData: unknown) {
    return this.entityModel.insertMany(entitiesData);
  }

  async findOneAndUpdate(
    filter: FilterQuery<T>,
    updateEntityData: UpdateQuery<T>,
    populate?: PopulateOptions,
    session?: ClientSession,
  ) {
    return this.entityModel.findOneAndUpdate(filter, updateEntityData, {
      new: true,
      populate,
      session,
    });
  }

  async exists(filter: FilterQuery<T>) {
    return this.entityModel.exists(filter);
  }

  async count(filter?: FilterQuery<T>) {
    return this.entityModel.countDocuments(filter);
  }

  async deleteMany(filter?: FilterQuery<T>) {
    return this.entityModel.deleteMany(filter);
  }

  async updateMany(
    filter: FilterQuery<T> = {},
    updateEntityData: UpdateQuery<T>,
  ) {
    return this.entityModel.updateMany(filter, updateEntityData);
  }

  async findOneAndDelete(filter: FilterQuery<T>) {
    return this.entityModel.findOneAndDelete(filter, { new: true });
  }

  async aggregate(pipeline: PipelineStage[], options?: AggregateOptions) {
    return this.entityModel.aggregate(pipeline, options);
  }

  async bulkWrite(ops: any[], options?: MongooseBulkWriteOptions) {
    return this.entityModel.bulkWrite(ops, options);
  }

  async aggregateWithPagination<T>(
    pipeline: PipelineStage[],
    page = 1,
    limit = 10,
  ): Promise<PaginationType<T>> {
    try {
      const skip = (page - 1) * limit;

      const facetPipeline: PipelineStage[] = [
        ...pipeline,
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
        {
          $project: {
            data: 1,
            totalCount: {
              $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0],
            },
          },
        },
      ];
      const result = (await this.entityModel
        .aggregate(facetPipeline)
        .exec()) as AggregationPaginationResult<T>;

      if (!result[0]) {
        this.logger.error(
          'No data returned from aggregate pipeline in pagination',
        );
        throw new CustomHttpException(
          EXCEPTIONS.SERVER_ERROR,
          'Error in Fetching a data using pagination',
        );
      }
      const { data, totalCount } = result[0];

      const count = totalCount;
      const totalPages = Math.ceil(count / limit);

      return {
        totalItems: count,
        totalPages,
        currentPage: page,
        data,
      };
    } catch (error) {
      this.logger.error(`Unexpected error in pagination: ${error}`);
      throw new CustomHttpException(
        EXCEPTIONS.SERVER_ERROR,
        'Error in Fetching a data using pagination',
      );
    }
  }
  async deleteOne(filter?: FilterQuery<T>) {
    return this.entityModel.deleteOne(filter);
  }
}
