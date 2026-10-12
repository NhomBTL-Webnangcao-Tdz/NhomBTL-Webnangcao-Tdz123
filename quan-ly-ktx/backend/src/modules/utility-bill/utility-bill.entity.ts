import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
// import { Room } from '../room/room.entity'; // (Gia su ban khac lam Room)

@Entity()
export class UtilityBill {
  @PrimaryGeneratedColumn()
  bill_id: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  old_electric_index: number;

  @Column({ type: 'int' })
  new_electric_index: number;

  @Column({ type: 'int' })
  old_water_index: number;

  @Column({ type: 'int' })
  new_water_index: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column({ default: false })
  is_paid: boolean;

  // @ManyToOne(() => Room, (room) => room.utilityBills)
  // @JoinColumn({ name: 'room_id' })
  // room: Room;
}