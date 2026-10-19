import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../common/role.enum';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApproveResidenceRequestDto } from './dto/approve-residence-request.dto';
import { StudentService } from './student.service';

interface AuthenticatedManagerRequest {
  user: { sub: number };
}

@Controller('residence-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class ResidenceRequestController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  list() {
    return this.studentService.listResidenceRequests();
  }

  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedManagerRequest,
    @Body() details: ApproveResidenceRequestDto,
  ) {
    return this.studentService.reviewResidenceRequest(id, req.user.sub, 'approve', details);
  }

  @Patch(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedManagerRequest,
    @Body() details: { reviewNote?: string },
  ) {
    return this.studentService.reviewResidenceRequest(id, req.user.sub, 'reject', details);
  }
}
