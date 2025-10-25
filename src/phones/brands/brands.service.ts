import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandsRepository } from './brands.repository';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';

@Injectable()
export class BrandsService {
  constructor(private readonly brandsRepository: BrandsRepository) {}
  async create(createBrandDto: CreateBrandDto) {
    const existingBrand = await this.brandsRepository.findOne({
      name: createBrandDto.name,
    });
    if (existingBrand) {
      throw new CustomHttpException(EXCEPTIONS.ALREADY_EXISTS);
    }
    return this.brandsRepository.create(createBrandDto);
  }

  async findAll() {
    const brands = await this.brandsRepository.find({});
    return brands;
  }

  findOne(id: number) {
    return `This action returns a #${id} brand`;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const existingBrand = await this.brandsRepository.findOne({
      _id: id,
    });

    if (!existingBrand) {
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND);
    }
    return this.brandsRepository.updateOne(
      { _id: id },
      {
        $set: updateBrandDto,
      },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} brand`;
  }
}
