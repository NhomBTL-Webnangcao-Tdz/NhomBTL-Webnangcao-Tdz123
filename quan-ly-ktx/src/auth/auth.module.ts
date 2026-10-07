import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from './entities/users.service';
import { userProviders } from './entities/user.provider';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * AuthModule - Module xử lý Authentication & Authorization
 *
 * Import:
 *  - DatabaseModule : Để dùng DATA_SOURCE inject User Repository
 *  - JwtModule      : Để sign và verify JWT tokens
 *
 * Providers:
 *  - userProviders  : Cung cấp USER_REPOSITORY từ DataSource
 *  - UsersService   : Logic truy vấn database user
 *  - AuthService    : Logic đăng ký, đăng nhập
 *  - JwtAuthGuard   : Custom Guard verify Bearer Token
 *
 * Exports:
 *  - AuthService, JwtAuthGuard, JwtModule để các module khác dùng nếu cần
 */
@Module({
  imports: [
    // Import DatabaseModule để có DATA_SOURCE provider
    DatabaseModule,

    // Cấu hình JwtModule với secret key và thời hạn token
    JwtModule.register({
      global: true, // Đăng ký global để dùng ở bất kỳ module nào mà không cần import lại
      secret: process.env.JWT_SECRET || 'super-secret-jwt-key-quan-ly-ktx',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any, // Token hết hạn sau 1 giờ
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...userProviders, // USER_REPOSITORY
    UsersService,
    AuthService,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, UsersService],
})
export class AuthModule {}
