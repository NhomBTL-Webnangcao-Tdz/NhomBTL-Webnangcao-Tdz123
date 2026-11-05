import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesGuard } from '../../common/roles.guard';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ReportController],
  providers: [RolesGuard, ReportService],
})
export class ReportModule {}
