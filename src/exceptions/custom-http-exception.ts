/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus } from '@nestjs/common';
import { EXCEPTIONS } from './exceptions-list';
import { ErrorMessage, Exception } from '@/common/types/exception-types';

export class CustomHttpException extends HttpException {
  constructor(
    exception: Exception,
    message?: ErrorMessage,
    status?: HttpStatus,
  ) {
    if (message) exception.message = message;
    if (status) exception.statusCode = status;
    super(exception, exception.statusCode);
  }

  static createException(type: keyof typeof EXCEPTIONS) {
    const exception = EXCEPTIONS[type];
    return new CustomHttpException(exception);
  }
}
