import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './entities/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * AuthService - Service xử lý logic Authentication & Authorization
 *
 * Các chức năng:
 *  - register() : Đăng ký tài khoản mới, băm mật khẩu, lưu DB
 *  - login()    : Xác thực credentials, tạo và trả về JWT token
 *  - getProfile(): Lấy thông tin user từ JWT payload
 */
@Injectable()
export class AuthService {
  // Số vòng salt cho bcrypt (12 là mức khuyến nghị cho production)
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================================================
  // POST /auth/register
  // =========================================================
  /**
   * Đăng ký tài khoản người dùng mới
   * @param registerDto - Chứa username và password từ request body
   * @returns Object thông báo thành công và thông tin user (không có password)
   * @throws ConflictException nếu username đã tồn tại
   */
  async register(registerDto: RegisterDto) {
    const { username, password } = registerDto;

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException(`Username "${username}" đã được sử dụng.`);
    }

    // Băm mật khẩu bằng bcrypt trước khi lưu vào DB
    // bcrypt.hash() tự động tạo salt và kết hợp vào chuỗi hash
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Lưu user vào database với mật khẩu đã băm
    const newUser = await this.usersService.createUser(username, hashedPassword);

    // Trả về thông tin user nhưng loại bỏ password hash
    return {
      message: 'Đăng ký thành công!',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    };
  }

  // =========================================================
  // POST /auth/login
  // =========================================================
  /**
   * Đăng nhập và trả về JWT access_token
   * @param loginDto - Chứa username và password từ request body
   * @returns Object chứa access_token JWT
   * @throws UnauthorizedException nếu credentials không đúng
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Bước 1: Tìm user theo username
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      // Trả về lỗi chung, không tiết lộ username có tồn tại không (bảo mật)
      throw new UnauthorizedException('Username hoặc mật khẩu không đúng.');
    }

    // Bước 2: So sánh password nhập vào với hash đã lưu
    // bcrypt.compare() tự động lấy salt từ hash để so sánh
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username hoặc mật khẩu không đúng.');
    }

    // Bước 3: Tạo JWT payload
    // Chỉ lưu thông tin cần thiết, KHÔNG lưu password vào payload
    const payload = {
      sub: user.id,           // subject - convention của JWT, thường là user ID
      username: user.username,
      role: user.role,        // Đưa role vào token để RolesGuard sử dụng
    };

    // Bước 4: Ký và tạo JWT access_token
    const access_token = await this.jwtService.signAsync(payload);

    return {
      message: 'Đăng nhập thành công!',
      access_token,
    };
  }

  // =========================================================
  // GET /auth/profile (protected by JwtAuthGuard)
  // =========================================================
  /**
   * Lấy thông tin profile của user đang đăng nhập
   * JWT payload đã được giải mã và gắn vào request.user bởi JwtAuthGuard
   * @param userPayload - Payload từ JWT token (đã được Guard xác thực)
   * @returns Thông tin đầy đủ của user từ database
   */
  async getProfile(userPayload: { sub: number; username: string }) {
    // Lấy thông tin user đầy đủ từ DB theo ID trong token
    const user = await this.usersService.findById(userPayload.sub);

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại.');
    }

    // Trả về profile, loại bỏ password
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

