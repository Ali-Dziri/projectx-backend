import { PopulateOptions, SortOrder } from 'mongoose';

type Population = PopulateOptions | (PopulateOptions | string)[];

export type Options = {
  sort?: { [key: string]: SortOrder };
  projection?: Record<string, unknown>;
  populate?: Population;
  skip?: number;
  limit?: number;
  lean?: boolean;
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
