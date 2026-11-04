import { ConflictException, NotFoundException, Injectable, Inject } from '@nestjs/common';
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

  /** Danh sách tài khoản cho ADMIN, không gồm mật khẩu */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: { id: true, username: true, role: true, studentSid: true, createdAt: true },
      order: { id: 'ASC' },
    });
  }

  /** Đổi vai trò. Không cho tự đổi của mình và không cho hạ ADMIN cuối cùng để tránh mất quyền quản trị. */
  async updateRole(id: number, role: Role, actorId: number): Promise<User> {
    if (id === actorId) throw new ConflictException('Không thể tự đổi vai trò của chính mình.');
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản.');
    if (user.role === Role.ADMIN && role !== Role.ADMIN) {
      const admins = await this.usersRepository.count({ where: { role: Role.ADMIN } });
      if (admins <= 1) throw new ConflictException('Phải còn ít nhất một tài khoản ADMIN.');
    }
    user.role = role;
    return this.usersRepository.save(user);
  }

  /**
   * Tạo và lưu user mới vào database
   * @param username - Tên đăng nhập
   * @param hashedPassword - Mật khẩu đã được băm bằng bcrypt
   * @param role - Vai trò, mặc định STUDENT
   * @returns User vừa tạo
   */
  async createUser(username: string, hashedPassword: string, role: Role = Role.STUDENT): Promise<User> {
    const newUser = this.usersRepository.create({
      username,
      password: hashedPassword,
      role,
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
        throw new ConflictException('Tên đăng nhập hoặc hồ sơ sinh viên đã được liên kết.');
      }
      throw error;
    }
  }
}
