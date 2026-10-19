import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../student/student.entity';
import { Room } from '../room/room.entity';

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
}