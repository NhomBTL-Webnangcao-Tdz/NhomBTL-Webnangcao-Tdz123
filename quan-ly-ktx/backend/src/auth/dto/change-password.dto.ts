import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * ChangePasswordDto - Data Transfer Object cho API đổi mật khẩu
 */
export class ChangePasswordDto {
  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @MaxLength(72, { message: 'Mật khẩu không được vượt quá 72 ký tự' })
  currentPassword: string;

  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu không được vượt quá 72 ký tự' })
  newPassword: string;
}
