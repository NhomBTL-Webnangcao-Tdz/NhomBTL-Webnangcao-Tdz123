import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * JwtAuthGuard - Custom Guard thực hiện xác thực JWT
 *
 * Implements CanActivate interface của NestJS.
 * Guard này sẽ:
 *   1. Lấy Bearer Token từ Authorization header
 *   2. Giải mã (verify) JWT token bằng secret key
 *   3. Đính kèm payload vào request.user nếu hợp lệ
 *   4. Ném UnauthorizedException nếu token không hợp lệ hoặc thiếu
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Phương thức chính của Guard - NestJS tự động gọi trước khi xử lý request
   * @param context - ExecutionContext chứa thông tin request hiện tại
   * @returns true nếu được phép truy cập, ném exception nếu không
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lấy HTTP request từ execution context
    const request = context.switchToHttp().getRequest<Request>();

    // Bước 1: Trích xuất token từ Authorization header
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Thiếu token xác thực. Vui lòng đăng nhập và cung cấp Bearer Token.',
      );
    }

    try {
      // Bước 2: Verify và giải mã JWT token
      // JwtService.verifyAsync() sẽ ném exception nếu token hết hạn hoặc không hợp lệ
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'super-secret-jwt-key-quan-ly-ktx',
      });

      // Bước 3: Đính kèm payload vào request để Controller có thể dùng
      // payload chứa: { sub: userId, username: '...', role: '...', iat: ..., exp: ... }
      (request as any)['user'] = payload;
    } catch {
      throw new UnauthorizedException(
        'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      );
    }

    // Bước 4: Cho phép request đi tiếp
    return true;
  }

  /**
   * Trích xuất Bearer Token từ Authorization header
   * Header format: "Authorization: Bearer <token>"
   * @param request - HTTP Request
   * @returns token string hoặc undefined nếu không có
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const authorizationHeader = request.headers['authorization'];

    if (!authorizationHeader) {
      return undefined;
    }

    // Tách "Bearer" và token
    const [type, token] = authorizationHeader.split(' ');

    // Chỉ chấp nhận kiểu Bearer
    return type === 'Bearer' ? token : undefined;
  }
}
