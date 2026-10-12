import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Student } from '../student/student.entity';
// import { Room } from '../room/room.entity'; // (Gia su ban khac lam Room)
// import { Payment } from '../payment/payment.entity'; // (Gia su ban khac lam Payment)

@Entity()
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

  // @ManyToOne(() => Room, (room) => room.contracts)
  // @JoinColumn({ name: 'room_id' })
  // room: Room;

  // @OneToMany(() => Payment, (payment) => payment.contract)
  // payments: Payment[];
}