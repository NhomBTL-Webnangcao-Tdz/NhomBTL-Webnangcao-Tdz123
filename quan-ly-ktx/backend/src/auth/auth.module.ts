import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    ConfigModule,

    JwtModule.registerAsync({
      global: true, // Đăng ký global để dùng ở bất kỳ module nào mà không cần import lại
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'Thiếu JWT_SECRET. Thêm JWT_SECRET=<secret riêng, ít nhất 32 ký tự> vào quan-ly-ktx/backend/.env rồi khởi động lại backend.',
          );
        }
        if (secret.length < 32) {
          throw new Error('JWT_SECRET phải có ít nhất 32 ký tự.');
        }
        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
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
