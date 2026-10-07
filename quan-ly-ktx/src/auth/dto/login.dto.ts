import { IsString, IsNotEmpty } from 'class-validator';

/**
 * LoginDto - Data Transfer Object cho API đăng nhập
 */
export class LoginDto {
  @IsString({ message: 'Username phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  username: string;

  @IsString({ message: 'Password phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
}

