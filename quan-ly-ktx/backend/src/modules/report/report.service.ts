import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Contract } from '../contract/contract.entity';
import { Payment } from '../payment/payment.entity';
import { Room } from '../room/room.entity';
import { Student } from '../student/student.entity';
import { UtilityBill } from '../utility-bill/utility-bill.entity';
import { UtilityBillShare } from '../utility-bill/utility-bill-share.entity';

@Injectable()
export class ReportService {
  constructor(@Inject('DATA_SOURCE') private readonly dataSource: DataSource) {}

  async getSummary() {
    const repositories = {
      students: this.dataSource.getRepository(Student),
      rooms: this.dataSource.getRepository(Room),
      contracts: this.dataSource.getRepository(Contract),
      payments: this.dataSource.getRepository(Payment),
      bills: this.dataSource.getRepository(UtilityBill),
      shares: this.dataSource.getRepository(UtilityBillShare),
    };

    const today = this.today();
    const monthStart = `${today.slice(0, 7)}-01 00:00:00`;
    const nextMonthStart = this.firstDayOfNextMonth(today);
    const [
      students,
      rooms,
      activeContracts,
      occupiedRooms,
      paymentsThisMonth,
      billShareDebt,
      legacyBillDebt,
    ] = await Promise.all([
      repositories.students.count(),
      repositories.rooms.count(),
      repositories.contracts.createQueryBuilder('contract')
        .where('contract.is_active = :isActive', { isActive: true })
        .andWhere('contract.start_date <= :today', { today })
        .andWhere('contract.end_date >= :today', { today })
        .getCount(),
      repositories.contracts.createQueryBuilder('contract')
        .innerJoin('contract.room', 'room')
        .select('COUNT(DISTINCT room.id)', 'total')
        .where('contract.is_active = :isActive', { isActive: true })
        .andWhere('contract.start_date <= :today', { today })
        .andWhere('contract.end_date >= :today', { today })
        .getRawOne<{ total: string }>(),
      repositories.payments.createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'total')
        .where('payment.payment_date >= :monthStart', { monthStart })
        .andWhere('payment.payment_date < :nextMonthStart', { nextMonthStart })
        .getRawOne<{ total: string }>(),
      repositories.shares.createQueryBuilder('share')
        .select('COALESCE(SUM(share.amount), 0)', 'total')
        .where('share.is_paid = :isPaid', { isPaid: false })
        .getRawOne<{ total: string }>(),
      repositories.bills.createQueryBuilder('bill')
        .leftJoin('bill.shares', 'share')
        .select('COALESCE(SUM(bill.total_amount), 0)', 'total')
        .where('bill.is_paid = :isPaid', { isPaid: false })
        .andWhere('share.id IS NULL')
        .getRawOne<{ total: string }>(),
    ]);

    return {
      students,
      rooms,
      activeContracts,
      occupiedRooms: Number(occupiedRooms?.total ?? 0),
      outstandingDebt: Number(billShareDebt?.total ?? 0) + Number(legacyBillDebt?.total ?? 0),
      paymentsThisMonth: Number(paymentsThisMonth?.total ?? 0),
    };
  }

  private today(): string {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
  }

  private firstDayOfNextMonth(today: string): string {
    const [year, month] = today.split('-').map(Number);
    const nextMonth = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`;
    return `${nextMonth}-01 00:00:00`;
  }
}
