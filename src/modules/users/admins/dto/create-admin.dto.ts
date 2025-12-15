import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PhoneDto } from 'src/common/dtos/phone.dto';

export class CreateAdminDto {
  @IsString({ message: 'firstname must be a string' })
  @IsNotEmpty({ message: 'lastname is required' })
  firstname: string;

  @IsString({ message: 'lastname must be a string' })
  @IsNotEmpty({ message: 'lastname is required' })
  lastname: string;

  @IsEmail({}, { message: 'Email is not valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'username must be a string' })
  @IsNotEmpty({ message: 'username is required' })
  username: string;

  @Type(() => PhoneDto)
  @ValidateNested({ each: true })
  @IsNotEmpty({ message: 'phone is required' })
  phone: PhoneDto;
}
