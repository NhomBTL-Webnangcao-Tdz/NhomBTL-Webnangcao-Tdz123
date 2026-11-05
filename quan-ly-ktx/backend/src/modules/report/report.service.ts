import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Contract } from '../contract/contract.entity';
import { Payment } from '../payment/payment.entity';
import { Room } from '../room/room.entity';
import { Student } from '../student/student.entity';
import { UtilityBill } from '../utility-bill/utility-bill.entity';
import { UtilityBillShare } from '../utility-bill/utility-bill-share.entity';
import { ReportSummaryQueryDto } from './dto/report-summary-query.dto';

const CONTRACT_EXPIRY_WINDOW_DAYS = 30;

@Injectable()
export class ReportService {
  constructor(@Inject('DATA_SOURCE') private readonly dataSource: DataSource) {}

  async getSummary(query: ReportSummaryQueryDto = {}) {
    const repositories = {
      students: this.dataSource.getRepository(Student),
      rooms: this.dataSource.getRepository(Room),
      contracts: this.dataSource.getRepository(Contract),
      payments: this.dataSource.getRepository(Payment),
      bills: this.dataSource.getRepository(UtilityBill),
      shares: this.dataSource.getRepository(UtilityBillShare),
    };

    const today = this.today();
    const [currentYear, currentMonth] = today.split('-').map(Number);
    const month = query.month ?? currentMonth;
    const year = query.year ?? currentYear;
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
    const nextMonthStart = this.firstDayOfNextMonth(year, month);
    const expiryEnd = this.addDays(today, CONTRACT_EXPIRY_WINDOW_DAYS);
    const [
      students,
      rooms,
      activeContracts,
      occupiedRooms,
      occupancyByBuilding,
      expiringContracts,
      paymentsInPeriod,
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
      repositories.rooms.createQueryBuilder('room')
        .select('room.building', 'building')
        .addSelect('COUNT(room.id)', 'roomCount')
        .addSelect('SUM(room.currentOccupancy)', 'occupiedStudents')
        .addSelect('SUM(room.maxCapacity)', 'capacity')
        .groupBy('room.building')
        .orderBy('room.building', 'ASC')
        .getRawMany<{
          building: string;
          roomCount: string;
          occupiedStudents: string;
          capacity: string;
        }>(),
      repositories.contracts.createQueryBuilder('contract')
        .innerJoin('contract.student', 'student')
        .leftJoin('contract.room', 'room')
        .select('contract.contract_id', 'contractId')
        .addSelect('contract.end_date', 'endDate')
        .addSelect('student.sid', 'studentSid')
        .addSelect('student.sname', 'studentName')
        .addSelect('room.roomNumber', 'roomNumber')
        .addSelect('room.building', 'building')
        .where('contract.is_active = :isActive', { isActive: true })
        .andWhere('contract.start_date <= :today', { today })
        .andWhere('contract.end_date >= :today', { today })
        .andWhere('contract.end_date <= :expiryEnd', { expiryEnd })
        .orderBy('contract.end_date', 'ASC')
        .getRawMany<{
          contractId: number;
          endDate: string | Date;
          studentSid: string;
          studentName: string;
          roomNumber: string | null;
          building: string | null;
        }>(),
      repositories.payments.createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'total')
        .where('payment.payment_date >= :monthStart', { monthStart })
        .andWhere('payment.payment_date < :nextMonthStart', { nextMonthStart })
        .getRawOne<{ total: string }>(),
      repositories.shares.createQueryBuilder('share')
        .select('COALESCE(SUM(share.amount), 0)', 'total')
        .innerJoin('share.bill', 'bill')
        .where('share.is_paid = :isPaid', { isPaid: false })
        .andWhere('bill.month = :month', { month })
        .andWhere('bill.year = :year', { year })
        .getRawOne<{ total: string }>(),
      repositories.bills.createQueryBuilder('bill')
        .leftJoin('bill.shares', 'share')
        .select('COALESCE(SUM(bill.total_amount), 0)', 'total')
        .where('bill.is_paid = :isPaid', { isPaid: false })
        .andWhere('bill.month = :month', { month })
        .andWhere('bill.year = :year', { year })
        .andWhere('share.id IS NULL')
        .getRawOne<{ total: string }>(),
    ]);

    const buildingOccupancy = occupancyByBuilding.map((building) => {
      const capacity = Number(building.capacity ?? 0);
      const occupiedStudents = Number(building.occupiedStudents ?? 0);
      return {
        building: building.building,
        roomCount: Number(building.roomCount ?? 0),
        occupiedStudents,
        capacity,
        occupancyRate: capacity ? Math.round((occupiedStudents / capacity) * 1000) / 10 : 0,
      };
    });

    return {
      month,
      year,
      students,
      rooms,
      activeContracts,
      occupiedRooms: Number(occupiedRooms?.total ?? 0),
      occupancyByBuilding: buildingOccupancy,
      expiringContracts: expiringContracts.map((contract) => {
        const endDate = this.asDay(contract.endDate);
        return {
          contractId: Number(contract.contractId),
          studentSid: contract.studentSid,
          studentName: contract.studentName,
          roomNumber: contract.roomNumber,
          building: contract.building,
          endDate,
          daysRemaining: this.daysBetween(today, endDate),
        };
      }),
      outstandingDebt: Number(billShareDebt?.total ?? 0) + Number(legacyBillDebt?.total ?? 0),
      paymentsInPeriod: Number(paymentsInPeriod?.total ?? 0),
      paymentsThisMonth: Number(paymentsInPeriod?.total ?? 0),
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

  private firstDayOfNextMonth(year: number, month: number): string {
    const nextMonth = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`;
    return `${nextMonth}-01 00:00:00`;
  }

  private addDays(day: string, days: number): string {
    const date = new Date(`${day}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  private daysBetween(start: string, end: string): number {
    return Math.round((Date.parse(`${end}T00:00:00.000Z`) - Date.parse(`${start}T00:00:00.000Z`)) / 86400000);
  }

  private asDay(value: string | Date): string {
    return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
  }
}
