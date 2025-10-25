import { Module, Global } from '@nestjs/common';
import { CodeGeneratorService } from './generators/code-generators.service';
import { SlugifyFactory } from './generators/slugify.service';
@Global()
@Module({
  providers: [CodeGeneratorService, SlugifyFactory],
  exports: [CodeGeneratorService, SlugifyFactory],
})
export class UtilsModule {}
