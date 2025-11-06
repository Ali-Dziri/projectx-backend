import { HttpStatus, Logger } from '@nestjs/common';
import {
  AggregateOptions,
  Document,
  FilterQuery,
  Model,
  MongooseBulkWriteOptions,
  PipelineStage,
  SaveOptions,
  UpdateQuery,
} from 'mongoose';
import { CustomHttpException } from 'src/exceptions/custom-http-exception';
import { EXCEPTIONS } from 'src/exceptions/exceptions-list';
import { Options, PaginationType, AggregationPaginationResult } from './types';
import { ApiResponse } from '@/common/types/api-response';

export abstract class EntityRepository<T extends Document> {
  protected readonly logger = new Logger(EntityRepository.name);
  protected constructor(protected entityModel: Model<T>) {}

  async findOne(
    filter: FilterQuery<T>,
    options?: Options,
  ): Promise<ApiResponse<T> | null> {
    const { sort, projection, populate, limit, lean, session } = options || {};
    const query = this.entityModel.findOne(filter, projection);
    if (sort) query.sort(sort);
    if (limit) query.limit(limit);
    if (populate) query.populate(populate);
    if (lean) query.lean();
    if (session) query.session(session);
    return {
      statusCode: 200,
      message: 'success',
      data: (await query.exec()) as T,
    };
  }

  async find(
    filter: FilterQuery<T>,
    options?: Options,
  ): Promise<ApiResponse<T[]>> {
    const { sort, projection, populate, skip, limit, lean, session } =
      options || {};
    const query = this.entityModel.find(filter, projection);
    if (sort) query.sort(sort);
    if (populate) query.populate(populate);
    if (skip) query.skip(skip);
    if (limit) query.limit(limit);
    if (lean) query.lean();
    if (session) query.session(session);
    return {
      statusCode: 200,
      message: 'success',
      data: await query.exec(),
    };
  }

  async create(
    createEntityData: Partial<T> | T,
    options?: SaveOptions,
  ): Promise<ApiResponse<T>> {
    const entity = new this.entityModel(createEntityData);
    const result = await entity.save(options);
    return {
      statusCode: 201,
      message: 'success',
      data: result,
    };
  }

  async updateOne(
    filter: FilterQuery<T>,
    updateEntityData: UpdateQuery<T>,
    options?: Options,
  ): Promise<ApiResponse<T>> {
    const result = await this.entityModel.updateOne(filter, updateEntityData, {
      ...options,
    });
    return {
      statusCode: 200,
      message: 'success',
      data: result as unknown as T,
    };
  }

  async insertMany(
    entitiesData: T[] | Partial<T>[] | unknown[],
  ): Promise<ApiResponse<T[]>> {
    const result = await this.entityModel.insertMany(entitiesData);
    return {
      statusCode: 201,
      message: 'success',
      data: result,
    };
  }

  async findOneAndUpdate(
    filter: FilterQuery<T>,
    updateEntityData: UpdateQuery<T>,
    options?: Options,
  ): Promise<ApiResponse<T>> {
    const result = await this.entityModel.findOneAndUpdate(
      filter,
      updateEntityData,
      {
        new: true,
        ...options,
      },
    );

    return {
      statusCode: 200,
      message: 'success',
      data: result as T,
    };
  }

  exists(filter: FilterQuery<T>) {
    return this.entityModel.exists(filter);
  }

  countDocuments(filter?: FilterQuery<T>) {
    return this.entityModel.countDocuments(filter);
  }

  deleteMany(filter?: FilterQuery<T>) {
    return this.entityModel.deleteMany(filter);
  }

  updateMany(filter: FilterQuery<T> = {}, updateEntityData: UpdateQuery<T>) {
    return this.entityModel.updateMany(filter, updateEntityData);
  }

  findOneAndDelete(filter: FilterQuery<T>) {
    return this.entityModel.findOneAndDelete(filter, { new: true });
  }

  aggregate(pipeline: PipelineStage[], options?: AggregateOptions) {
    return this.entityModel.aggregate(pipeline, options);
  }

  bulkWrite(ops: any[], options?: MongooseBulkWriteOptions) {
    return this.entityModel.bulkWrite(ops, options);
  }

  async aggregateWithPagination<T>(
    pipeline: PipelineStage[],
    page = 1,
    limit = 10,
  ): Promise<ApiResponse<PaginationType<T>>> {
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
        statusCode: HttpStatus.OK,
        message: 'success',
        data: {
          totalItems: count,
          totalPages,
          currentPage: page,
          data,
        },
      };
    } catch (error) {
      this.logger.error(`Unexpected error in pagination: ${error}`);
      throw new CustomHttpException(
        EXCEPTIONS.SERVER_ERROR,
        'Error in Fetching a data using pagination',
      );
    }
  }
  deleteOne(filter?: FilterQuery<T>) {
    return this.entityModel.deleteOne(filter);
  }
}
