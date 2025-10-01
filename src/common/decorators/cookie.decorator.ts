import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const cookie: unknown = data ? request.cookies?.[data] : request.cookies;

    return cookie;
  },
);
