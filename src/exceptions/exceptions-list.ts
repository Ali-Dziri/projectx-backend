import { HttpStatus } from '@nestjs/common';
import { Exception } from 'src/common/types/exception-types';

export const EXCEPTIONS = {
  BAD_REQUEST: <Exception>{
    type: 'BAD_REQUEST',
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Invalid request',
  },
  SERVER_ERROR: <Exception>{
    type: 'SERVER_ERROR',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  },
  NOT_FOUND: <Exception>{
    type: 'NOT_FOUND',
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Ressouce has not been found',
  },
  ALREADY_EXISTS: <Exception>{
    type: 'ALREADY_EXISTS',
    statusCode: HttpStatus.CONFLICT,
    message: 'Ressouce already exists',
  },
  PASSWORD_INVALID: <Exception>{
    type: 'PASSWORD_INVALID',
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'Password is invalid',
  },
  TOKEN_INVALID: <Exception>{
    type: 'TOKEN_INVALID',
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'Token is invalid',
  },
  UNAUTHORIZED: <Exception>{
    type: 'UNAUTHORIZED',
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'Unauthorized request',
  },
  USER_NOT_FOUND: <Exception>{
    type: 'USER_NOT_FOUND',
    statusCode: HttpStatus.NOT_FOUND,
    message: 'User has not been found',
  },
};
