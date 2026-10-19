import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesGuard } from '../../common/roles.guard';
import { MeterReadingController } from './meter-reading.controller';
import { MeterReadingService } from './meter-reading.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [MeterReadingController],
  providers: [RolesGuard, MeterReadingService],
})
export class MeterReadingModule {}
