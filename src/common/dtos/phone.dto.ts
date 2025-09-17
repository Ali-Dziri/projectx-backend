import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class PhoneDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4)
  @MinLength(1)
  code: string;

  @IsNotEmpty()
  @IsString()
  number: string;
}
