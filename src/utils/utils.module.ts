import { Module, Global } from '@nestjs/common';
import { CodeGeneratorService } from './generators/code-generators.service';

@Global()
@Module({
  providers: [CodeGeneratorService],
  exports: [CodeGeneratorService],
})
export class UtilsModule {}
