import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { StudentModule } from './modules/student/student.entity';
import { RoomModule } from './modules/room/room.entity';
import { ContractModule } from './modules/contract/contract.entity';
import { UtilityBillModule } from './modules/utility-bill/utility-bill.entity';
import { PaymentModule } from './modules/payment/payment.entity';
import { CommonModule } from './common/common.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'quan-ly-ktx',
    }),
    StudentModule,
    RoomModule,
    ContractModule,
    UtilityBillModule,
    PaymentModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

@Module({
  imports: [DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}