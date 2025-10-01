import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Exception } from '@/common/types/exception-types';
import { EXCEPTIONS } from './exceptions-list';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : EXCEPTIONS.SERVER_ERROR.statusCode;

    const responseBody: Exception = {
      statusCode: httpStatus,
      type:
        exception instanceof HttpException
          ? exception.name
          : EXCEPTIONS.SERVER_ERROR.type,
      message:
        exception instanceof HttpException
          ? exception.message
          : EXCEPTIONS.SERVER_ERROR.message,
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      timestamp: new Date().toISOString(),
    };
    this.logger.error(JSON.stringify(responseBody));
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
