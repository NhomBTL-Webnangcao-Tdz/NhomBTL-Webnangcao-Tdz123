import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Role } from '../../common/role.enum';

/**
 * Entity User - Đại diện cho bảng `users` trong CSDL
 *
 * Cấu trúc bảng:
 * - id       : Khóa chính tự tăng
 * - username : Tên đăng nhập, duy nhất
 * - password : Mật khẩu đã được băm bằng bcrypt
 * - role     : Phân quyền (ADMIN | STUDENT | MANAGER)
 */
@Entity('users')
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  username: string;

  @Column()
  password: string; // Luôn lưu dạng hash, KHÔNG lưu plaintext

  @Column({ type: 'enum', enum: Role, default: Role.STUDENT })
  role: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

