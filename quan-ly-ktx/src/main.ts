import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật validation pipe global để class-validator hoạt động với DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Loại bỏ các field không khai báo trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu có field lạ
      transform: true,       // Tự động transform kiểu dữ liệu
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
