import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Role } from '../../common/role.enum';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { ReportService } from './report.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('summary')
  getSummary() {
    return this.reportService.getSummary();
  }
}
