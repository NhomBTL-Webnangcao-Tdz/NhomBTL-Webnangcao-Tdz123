import { Module } from '@nestjs/common';
import { UtilityBillController } from './utility-bill.controller';
import { UtilityBillService } from './utility-bill.service';
import { utilityBillProviders } from './utility-bill.provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UtilityBillController],
  providers: [
    ...utilityBillProviders,
    UtilityBillService,
  ],
})
export class UtilityBillModule {}