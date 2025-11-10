/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP', { timestamp: true });
  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, baseUrl } = req;
    const userAgent = req.get('user-agent') || '';

    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const id = (req.user as { id?: string })?.id;

      const logMsg = `${method} ${baseUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}  - Id ${id ?? 'N/A'}`;

      switch (true) {
        case statusCode >= 400 && statusCode < 500:
          this.logger.warn(logMsg);
          break;
        case statusCode >= 500:
          this.logger.error(logMsg);
          break;
        default:
          this.logger.log(logMsg);
      }
    });
    next();
  }
}
