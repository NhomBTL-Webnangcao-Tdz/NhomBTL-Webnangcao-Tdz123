import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RoomModule } from './modules/room/room.module';
import { StudentModule } from './modules/student/student.module';
import { ContractModule } from './modules/contract/contract.module';
import { UtilityBillModule } from './modules/utility-bill/utility-bill.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Database connection (DataSource pattern)
    DatabaseModule,

    // Authentication & Authorization (JWT)
    AuthModule,

    // Business modules
    StudentModule,
    RoomModule,
    ContractModule,
    UtilityBillModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}