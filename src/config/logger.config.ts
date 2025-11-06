/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConsoleLogger } from '@nestjs/common';

export class CustomLogger extends ConsoleLogger {
  error(message: any, stack?: string | Error, context?: string): void {
    let errorMsg = message;
    let errorStack = stack;

    if (message instanceof Error) errorMsg = message?.['stack'];
    if (stack instanceof Error) errorStack = stack?.['stack'];

    super.error(errorMsg, errorStack, context);
  }
}
