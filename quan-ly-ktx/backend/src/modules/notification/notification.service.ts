import { Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Role } from '../../common/role.enum';
import { Contract } from '../contract/contract.entity';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('NOTIFICATION_REPOSITORY')
    private readonly notifications: Repository<Notification>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.runContractExpiryNotifications();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runContractExpiryNotifications() {
    try {
      const contracts = await this.dataSource.getRepository(Contract)
        .createQueryBuilder('contract')
        .innerJoin('contract.student', 'student')
        .innerJoin(User, 'user', 'user.student_sid = student.sid')
        .select('contract.contract_id', 'contractId')
        .addSelect('contract.end_date', 'endDate')
        .addSelect('user.id', 'userId')
        .where('contract.is_active = :active', { active: true })
        .andWhere('contract.start_date <= CURRENT_DATE()')
        .andWhere('contract.end_date >= CURRENT_DATE()')
        .andWhere('contract.end_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY)')
        .andWhere('user.role = :studentRole', { studentRole: Role.STUDENT })
        .getRawMany<{ contractId: number; endDate: Date | string; userId: number }>();

      for (const contract of contracts) {
        const [year, month, day] = contract.endDate instanceof Date
          ? [
              String(contract.endDate.getFullYear()),
              String(contract.endDate.getMonth() + 1).padStart(2, '0'),
              String(contract.endDate.getDate()).padStart(2, '0'),
            ]
          : String(contract.endDate).slice(0, 10).split('-');
        const title = 'Hợp đồng sắp hết hạn';
        const message = `Hợp đồng HĐ-${String(contract.contractId).padStart(4, '0')} sẽ hết hạn vào ngày ${day}/${month}/${year}. Vui lòng liên hệ ban quản lý để gia hạn.`;
        const existing = await this.notifications.findOne({
          where: { userId: contract.userId, title, message },
        });
        if (!existing) {
          await this.notifications.save(this.notifications.create({
            userId: contract.userId,
            title,
            message,
          }));
        }
      }
    } catch (error) {
      this.logger.error(
        'Không thể tạo thông báo hợp đồng sắp hết hạn.',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

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
