import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RoomModule } from './modules/room/room.module';
import { StudentModule } from './modules/student/student.module';
import { ContractModule } from './modules/contract/contract.module';
import { UtilityBillModule } from './modules/utility-bill/utility-bill.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { NotificationModule } from './modules/notification/notification.module';
import { MeterReadingModule } from './modules/meter-reading/meter-reading.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), 'quan-ly-ktx/backend/.env'),
        resolve(process.cwd(), '../backend/.env'),
      ],
    }),

    // Database connection (DataSource pattern)
    DatabaseModule,

    // Authentication & Authorization (JWT)
    AuthModule,

    // Business modules
    StudentModule,
    RoomModule,
    ContractModule,
    UtilityBillModule,
    NotificationModule,
    MeterReadingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}