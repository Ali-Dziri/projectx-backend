import { ClientSession, PopulateOptions, SortOrder } from 'mongoose';

type MongoosePopulateOptions = PopulateOptions | string[] | PopulateOptions[];

export type Options = {
  sort?: { [key: string]: SortOrder };
  projection?: Record<string, unknown>;
  populate?: MongoosePopulateOptions;
  skip?: number;
  limit?: number;
  lean?: boolean;
  session?: ClientSession;
};

export type PaginationType<T> = {
  totalItems: any;
  totalPages: number;
  currentPage: number;
  data: T[];
};

export type AggregationPaginationResult<T> = [
  {
    data: T[];
    totalCount: number;
  },
];
