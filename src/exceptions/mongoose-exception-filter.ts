import { Exception } from '@/common/types/exception-types';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Error } from 'mongoose';
import { EXCEPTIONS } from './exceptions-list';

type MONGOOSE_ERROR = {
  [key: string]: Exception;
};

const MONGOOSE_ERROR_MAPPING: MONGOOSE_ERROR = {
  [Error.ValidationError.name]: {
    statusCode: HttpStatus.BAD_REQUEST,
    type: EXCEPTIONS.BAD_REQUEST.type,
    message: 'Validation failed',
  },
  [Error.DocumentNotFoundError.name]: {
    statusCode: HttpStatus.NOT_FOUND,
    type: EXCEPTIONS.NOT_FOUND.type,
    message: 'Ressouce has not been found',
  },
  [Error.CastError.name]: {
    statusCode: HttpStatus.BAD_REQUEST,
    type: EXCEPTIONS.BAD_REQUEST.type,
    message: 'Invalid format',
  },
  [Error.ParallelSaveError.name]: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    type: EXCEPTIONS.SERVER_ERROR.type,
    message: 'Concurrency error: Record already being saved',
  },
  [Error.MongooseServerSelectionError.name]: {
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
    type: 'SERVICE_UNAVAILABLE',
    message: 'Database connection error',
  },
  [Error.MongooseBulkSaveIncompleteError.name]: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    type: EXCEPTIONS.SERVER_ERROR.type,
    message: 'Error occurred during bulk save',
  },
  [11000]: {
    statusCode: HttpStatus.CONFLICT,
    type: EXCEPTIONS.ALREADY_EXISTS.type,
    message: 'Ressouce already exists',
  },
};

@Catch(Error)
export class MongooseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongooseExceptionFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Error, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();

    let mappedError = MONGOOSE_ERROR_MAPPING[exception.name];

    if (!mappedError) {
      mappedError = {
        statusCode: EXCEPTIONS.SERVER_ERROR.statusCode,
        type: EXCEPTIONS.SERVER_ERROR.type,
        message: EXCEPTIONS.SERVER_ERROR.message,
      };
    }
    this.logger.error(exception.message);
    const finalResponse: Exception = {
      ...mappedError,
      path: httpAdapter.getRequestUrl(request) as string,
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(response, finalResponse, mappedError.statusCode);
  }
}
