import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from '../student/student.entity';
import { Room } from '../room/room.entity';
import { Payment } from '../payment/payment.entity';

@Entity('contract')
export class Contract {
  @PrimaryGeneratedColumn()
  contract_id: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  deposit_amount: number;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => Student, (student) => student.contracts)
  @JoinColumn({ name: 'sid' })
  student: Student;

  @ManyToOne(() => Room, (room) => room.contracts, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: Room | null;

  @OneToMany(() => Payment, (payment) => payment.contract)
  payments: Payment[];
}