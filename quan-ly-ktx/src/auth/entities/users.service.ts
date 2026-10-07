import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';

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
    return this.usersRepository.findOne({ where: { username } });
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
    });
    return this.usersRepository.save(newUser);
  }
}

