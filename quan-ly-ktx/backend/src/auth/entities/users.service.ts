import { ConflictException, Injectable, Inject } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../../common/role.enum';

/**
 * UsersService - Service quản lý thao tác với bảng users trong CSDL
 */
@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Tìm user theo username
   * @param username - Tên đăng nhập cần tìm
   * @returns User | null
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      select: { id: true, username: true, password: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  /**
   * Tìm user theo id
   * @param id - ID của user cần tìm
   * @returns User | null
   */
  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * Tạo và lưu user mới vào database
   * @param username - Tên đăng nhập
   * @param hashedPassword - Mật khẩu đã được băm bằng bcrypt
   * @returns User vừa tạo
   */
  async createUser(username: string, hashedPassword: string): Promise<User> {
    const newUser = this.usersRepository.create({
      username,
      password: hashedPassword,
      role: Role.STUDENT,
    });
    try {
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (
        error instanceof QueryFailedError
        && ['ER_DUP_ENTRY', '23505'].includes(
          (error.driverError as { code?: string }).code || '',
        )
      ) {
        throw new ConflictException('Tên đăng nhập đã được sử dụng.');
      }
      throw error;
    }
  }
}
