import { HttpStatus } from '@nestjs/common';

export type ErrorMessage = string | string[];

export type Exception<T> = {
  errorType: string;
  status: HttpStatus;
  message: ErrorMessage;
  data?: T;
};
