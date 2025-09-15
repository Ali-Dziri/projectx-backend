/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus } from '@nestjs/common';
import { EXCEPTIONS } from './exceptions-list';
import { ErrorMessage, Exception } from 'src/common/types';

export class CustomHttpException extends HttpException {
  constructor(
    exception: Exception<any>,
    message?: ErrorMessage,
    data?: any,
    status?: HttpStatus,
  ) {
    if (message) exception.message = message;
    if (status) exception.status = status;
    if (data) exception.data = data;
    super(exception.message, exception.status);
  }

  static createException(errorType: keyof typeof EXCEPTIONS) {
    const exception = EXCEPTIONS[errorType];
    return new CustomHttpException(exception);
  }
}
