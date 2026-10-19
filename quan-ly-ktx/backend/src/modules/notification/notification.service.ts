import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NOTIFICATION_REPOSITORY')
    private readonly notifications: Repository<Notification>,
  ) {}

  listForUser(userId: number) {
    return this.notifications.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 30,
    });
  }

  async markRead(id: string, userId: number) {
    const notification = await this.notifications.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Không tìm thấy thông báo.');
    if (!notification.isRead) {
      notification.isRead = true;
      await this.notifications.save(notification);
    }
    return notification;
  }
}
