import { Injectable, Logger } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CodeGeneratorService } from 'src/utils/generators/code-generators.service';
import { AdminRepository } from './admins.repository';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { Error as MongooseError, PipelineStage } from 'mongoose';
import { AdminAccountStatus } from '@/common/types/users-types';

@Injectable()
export class AdminsService {
  private readonly logger = new Logger(AdminsService.name);
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
      .codeFactory()
      .withType('ALPHANUMERIC')
      .withLength(12)
      .build();
    const createdAdmin = await this.adminRepository.create({
      ...createAdminDto,
      password,
    });
    return createdAdmin;
  }

  async findAll(page: number, limit: number, search: string) {
    const pipeline: PipelineStage[] = [
      ...(search
        ? [{ $match: { email: { $regex: search, $options: 'i' } } }]
        : []),
      {
        $match: {
          accountStatus: {
            $eq: AdminAccountStatus.ACTIVE,
          },
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          email: 1,
          username: 1,
          accountStatus: 1,
          phone: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];
    const admins = await this.adminRepository.aggregateWithPagination(
      pipeline,
      page,
      limit,
    );

    if (!admins.data) {
      this.logger.error('error fetching admins');
      throw new CustomHttpException(EXCEPTIONS.SERVER_ERROR);
    }

    return admins;
  }

  async findMe(userId: string) {
    const result = await this.adminRepository.findOne({
      _id: userId,
      accountStatus: AdminAccountStatus.ACTIVE,
    });

    if (!result) {
      this.logger.error('Admin not found');
      throw new CustomHttpException(EXCEPTIONS.NOT_FOUND);
    }

    return {
      id: result._id,
      email: result.email,
      username: result.username,
      firstname: result.firstname,
      lastname: result.lastname,
      phone: result.phone,
    };
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const admin = await this.adminRepository.findOne({ _id: id });
    if (!admin) {
      this.logger.error('Admin not found');
      throw new MongooseError.DocumentNotFoundError('Admin not found');
    }
    const data: Partial<UpdateAdminDto> = {
      firstname: updateAdminDto.firstname,
      lastname: updateAdminDto.lastname,
      username: updateAdminDto.username,
      phone: updateAdminDto.phone,
    };

    const result = await this.adminRepository.updateOne(
      { _id: id },
      {
        $set: data,
      },
    );
    if (!result) {
      this.logger.error('Failed to update admin');
      throw new CustomHttpException(EXCEPTIONS.SERVER_ERROR);
    }
    return result;
  }

  async remove(id: number) {
    const admin = await this.adminRepository.findOne({ _id: id });
    if (!admin) {
      this.logger.error('Admin not found');
      throw new MongooseError.DocumentNotFoundError('Admin not found');
    }
    return this.adminRepository.deleteOne({ _id: id });
  }
}
