import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { RolesGuard } from '../../common/roles.guard';
import { DatabaseModule } from '../../database/database.module';
import { PaymentController } from './payment.controller';
import { paymentProviders } from './payment.provider';
import { PaymentService } from './payment.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PaymentController],
  providers: [...paymentProviders, RolesGuard, PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
