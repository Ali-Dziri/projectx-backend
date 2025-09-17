import { HttpStatus } from '@nestjs/common';

export type ErrorMessage = string | string[];

export type Exception = {
  statusCode: HttpStatus;
  type: string;
  message: ErrorMessage;
  error?: object | string;
  path?: string;
  timestamp?: string;
};
