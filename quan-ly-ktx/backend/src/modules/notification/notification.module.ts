import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesGuard } from '../../common/roles.guard';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { notificationProviders } from './notification.provider';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [NotificationController],
  providers: [...notificationProviders, NotificationService, RolesGuard],
})
export class NotificationModule {}
