import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL]
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  });

  // Bật validation pipe global để class-validator hoạt động với DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Loại bỏ các field không khai báo trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu có field lạ
      transform: true,       // Tự động transform kiểu dữ liệu
    }),
  );

  await app.listen(process.env.PORT ?? 5000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 5000}`);
}
bootstrap();
