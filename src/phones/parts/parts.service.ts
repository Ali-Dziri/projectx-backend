import { Injectable } from '@nestjs/common';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartsRepository } from './parts.repository';
import { CodeGeneratorService } from '@/utils/generators/code-generators.service';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { SlugifyFactory } from '@/utils/generators/slugify.service';
import { ModelRepository } from '../models/models.repository';
import { CategoriesRepository } from '../categories/categories.repository';
@Injectable()
export class PartsService {
  constructor(
    private readonly partsRepository: PartsRepository,
    private readonly codeGenerator: CodeGeneratorService,
    private readonly slugifyFactory: SlugifyFactory,
    private readonly modelRepository: ModelRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(createPartDto: CreatePartDto) {
    const modelExist = await this.modelRepository.findOne({
      _id: createPartDto.modelId,
    });

    if (!modelExist?.data) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND, 'model not found');
    }

    const model = modelExist.data;

    const recordExist = await this.categoriesRepository.findOne({
      _id: createPartDto.categoryId,
    });

    if (!recordExist?.data) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND, 'category not found');
    }

    const category = recordExist.data;

    const name = createPartDto.name
      ? createPartDto.name
      : `${category.name}_${model.name}`;

    const slugifiedName = this.slugifyFactory
      .withText(name)
      .withLowerCase()
      .withReplaceSpacesWithUnderscore()
      .withRemoveNonWordChars()
      .build();

    const reference = this.codeGenerator
      .codeFactory()
      .withLength(12)
      .withType('ALPHANUMERIC')
      .withPrefix(slugifiedName)
      .build();

    const createdPart = await this.partsRepository.create({
      ...createPartDto,
      name,
      reference,
    });

    if (!createdPart) {
      throw new CustomHttpException(EXCEPTIONS.SERVER_ERROR);
    }
    return createdPart;
  }

  findAll() {
    return `This action returns all parts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} part`;
  }

  async update(id: string, updatePartDto: UpdatePartDto) {
    const existingPart = await this.partsRepository.findOne({
      _id: id,
    });

    if (!existingPart?.data) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND);
    }
    return this.partsRepository.updateOne(
      { _id: id },
      {
        $set: updatePartDto,
      },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} part`;
  }
}
