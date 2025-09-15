import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { EXCEPTIONS } from './exceptions-list';
import { Exception } from 'src/common/types';
import { CustomHttpException } from './custom-http-exception';
export class CustomValidatorPipe extends ValidationPipe {
  public async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    try {
      return await super.transform(value, metadata);
    } catch (error) {
      if (error instanceof BadRequestException) {
        const exception = EXCEPTIONS.BAD_REQUEST;
        const response = error.getResponse() as Exception<any>;
        if (typeof response === 'object' && 'message' in response) {
          exception.message = response.message as string;
          throw new CustomHttpException(exception);
        }
      }
    }
  }
}
