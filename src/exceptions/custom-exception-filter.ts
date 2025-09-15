import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Exception } from 'src/common/types';
import { EXCEPTIONS } from './exceptions-list';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus: number;
    let responseBody: Exception<any>;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();

      // Type guard to ensure response is Exception type
      responseBody =
        typeof response === 'object' &&
        response !== null &&
        'status' in response
          ? (response as Exception<any>)
          : ({
              status: httpStatus,
              message: exception.message || 'An error occurred',
            } as Exception<any>);
    } else {
      httpStatus = EXCEPTIONS.SERVER_ERROR.status;
      responseBody = EXCEPTIONS.SERVER_ERROR;
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
