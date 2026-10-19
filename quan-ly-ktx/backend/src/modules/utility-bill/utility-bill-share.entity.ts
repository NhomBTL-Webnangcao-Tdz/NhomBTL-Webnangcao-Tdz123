import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from '../student/student.entity';
import { UtilityBill } from './utility-bill.entity';

@Entity('utility_bill_share')
@Index('uq_utility_bill_share_bill_student', ['bill', 'student'], { unique: true })
export class UtilityBillShare {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UtilityBill, (bill) => bill.shares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bill_id' })
  bill: UtilityBill;

  @ManyToOne(() => Student, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_sid' })
  student: Student;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'room_rent_amount' })
  roomRentAmount: number;

  @Column({ type: 'boolean', default: false, name: 'is_paid' })
  isPaid: boolean;
}
