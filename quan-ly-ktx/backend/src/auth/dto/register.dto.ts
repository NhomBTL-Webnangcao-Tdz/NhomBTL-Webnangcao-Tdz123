import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * RegisterDto - Data Transfer Object cho API đăng ký
 */
export class RegisterDto {
  @IsString({ message: 'Username phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @MinLength(3, { message: 'Username phải có ít nhất 3 ký tự' })
  @MaxLength(100, { message: 'Username không được vượt quá 100 ký tự' })
  username: string;

  @IsString({ message: 'Password phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  password: string;
}

