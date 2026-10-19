import { Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Role } from '../../common/role.enum';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { NotificationService } from './notification.service';

interface AuthenticatedNotificationRequest {
  user: { sub: number };
}

@Controller('notifications/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.STUDENT)
export class NotificationController {
  constructor(private readonly notifications: NotificationService) {}

  @Get()
  list(@Request() req: AuthenticatedNotificationRequest) {
    return this.notifications.listForUser(req.user.sub);
  }

  @Patch(':id/read')
  markRead(
    @Param('id') id: string,
    @Request() req: AuthenticatedNotificationRequest,
  ) {
    return this.notifications.markRead(id, req.user.sub);
  }
}
