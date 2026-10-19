import { Module } from '@nestjs/common';
import { UtilityBillController } from './utility-bill.controller';
import { UtilityBillService } from './utility-bill.service';
import { utilityBillProviders } from './utility-bill.provider';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { RolesGuard } from '../../common/roles.guard';
import { UtilityTariffController } from './utility-tariff.controller';
import { UtilityTariffService } from './utility-tariff.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UtilityTariffController, UtilityBillController],
  providers: [
    ...utilityBillProviders,
    RolesGuard,
    UtilityBillService,
    UtilityTariffService,
  ],
})
export class UtilityBillModule {}