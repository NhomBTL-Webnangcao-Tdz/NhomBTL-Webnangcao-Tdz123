import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Role } from '../../common/role.enum';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { ReportService } from './report.service';
import { ReportSummaryQueryDto } from './dto/report-summary-query.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('summary')
  getSummary(@Query() query: ReportSummaryQueryDto) {
    return this.reportService.getSummary(query);
  }
}
