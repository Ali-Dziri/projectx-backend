import { HttpStatus } from '@nestjs/common';
import { Exception } from 'src/common/types';

export const EXCEPTIONS = {
  BAD_REQUEST: <Exception<any>>{
    errorType: 'BAD_REQUEST',
    status: HttpStatus.BAD_REQUEST,
    message: 'Invalid request',
  },
  SERVER_ERROR: <Exception<any>>{
    errorType: 'SERVER_ERROR',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  },
  NOT_FOUND: <Exception<any>>{
    errorType: 'NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    message: 'Ressouce has not been found',
  },
};
