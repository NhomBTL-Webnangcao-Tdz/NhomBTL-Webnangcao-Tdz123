import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
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
@Index('uq_users_student_sid', ['studentSid'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  username: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.STUDENT })
  role: Role;

  @Column({ type: 'varchar', name: 'student_sid', length: 15, nullable: true })
  studentSid: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
