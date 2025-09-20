import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Request } from 'express';

@Injectable()
export class CSRFTokenGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    const csrfSignatureHeader = request.headers['x-csrf-token'] as string;
    const csrfSignatureCookie = request.cookies['csrfSignature'] as string;

    return csrfSignatureHeader === csrfSignatureCookie;
  }
}
