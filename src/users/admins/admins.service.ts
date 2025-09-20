import { Injectable, Logger } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CodeGeneratorService } from 'src/utils/generators/code-generators.service';
import { AdminRepository } from './admins.repository';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { Error as MongooseError } from 'mongoose';
import { AdminAccountStatus } from '@/common/types/users-types';

@Injectable()
export class AdminsService {
  logger = new Logger(AdminsService.name);
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly codeGenerator: CodeGeneratorService,
  ) {}
  async create(createAdminDto: CreateAdminDto) {
    const exists = await this.adminRepository.exists({
      email: createAdminDto.email,
    });
    if (exists) {
      throw new CustomHttpException(
        EXCEPTIONS.ALREADY_EXISTS,
        'Admin with this email already exists',
      );
    }
    const password = this.codeGenerator
      .codeBuilder()
      .withType('ALPHANUMERIC')
      .withLength(12)
      .build();
    this.logger.log(password);
    const createdAdmin = await this.adminRepository.create({
      ...createAdminDto,
      password,
    });
    return createdAdmin;
  }

  async findAll() {
    const admins = await this.adminRepository.aggregateWithPagination(
      [
        {
          $match: {
            accountStatus: {
              $eq: AdminAccountStatus.PENDING,
            },
          },
        },
      ],
      1,
      10,
    );

    return admins;
  }

  async findOne(id: string) {
    const admin = await this.adminRepository.findOne({
      _id: id,
    });
    if (!admin) {
      throw new MongooseError.DocumentNotFoundError('Admin not found');
    }
    return admin;
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    this.logger.log('updateAdminDto', updateAdminDto);
    return `This action updates a #${id}admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
