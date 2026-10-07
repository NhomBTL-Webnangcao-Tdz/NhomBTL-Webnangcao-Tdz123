import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * AuthController - Controller xử lý các API endpoint Authentication
 *
 * Endpoints:
 *  POST /auth/register  →  Đăng ký người dùng mới
 *  POST /auth/login     →  Đăng nhập, nhận JWT token
 *  GET  /auth/profile   →  Xem profile (yêu cầu Bearer Token)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =========================================================
  // POST /auth/register
  // =========================================================
  /**
   * Đăng ký tài khoản mới
   *
   * Request Body:
   * {
   *   "username": "nguyen_van_a",
   *   "password": "matkhau123"
   * }
   *
   * Response 201:
   * {
   *   "message": "Đăng ký thành công!",
   *   "user": { "id": 1, "username": "nguyen_van_a", "role": "STUDENT", "createdAt": "..." }
   * }
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // =========================================================
  // POST /auth/login
  // =========================================================
  /**
   * Đăng nhập và nhận JWT access_token
   *
   * Request Body:
   * {
   *   "username": "nguyen_van_a",
   *   "password": "matkhau123"
   * }
   *
   * Response 200:
   * {
   *   "message": "Đăng nhập thành công!",
   *   "access_token": "eyJhbGciOiJIUzI1NiIs..."
   * }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // =========================================================
  // GET /auth/profile  →  PROTECTED ROUTE
  // =========================================================
  /**
   * Lấy thông tin profile của người dùng hiện tại
   * Route này được bảo vệ bởi JwtAuthGuard (Custom CanActivate)
   *
   * Headers yêu cầu:
   *   Authorization: Bearer <access_token>
   *
   * Response 200:
   * {
   *   "id": 1,
   *   "username": "nguyen_van_a",
   *   "role": "STUDENT",
   *   "createdAt": "2024-01-01T00:00:00.000Z",
   *   "updatedAt": "2024-01-01T00:00:00.000Z"
   * }
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard) // Áp dụng Custom JWT Guard - sẽ verify Bearer Token
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: any) {
    // req.user được gắn vào bởi JwtAuthGuard sau khi giải mã token thành công
    // req.user = { sub: userId, username: '...', role: '...', iat: ..., exp: ... }
    return this.authService.getProfile(req.user);
  }
}

