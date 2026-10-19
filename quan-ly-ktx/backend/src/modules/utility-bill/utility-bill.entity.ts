import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Room } from '../room/room.entity';
import { UtilityBillShare } from './utility-bill-share.entity';

@Entity('utility_bill')
export class UtilityBill {
  @PrimaryGeneratedColumn()
  bill_id: number;

  @Column({ type: 'varchar', length: 20, default: 'UTILITY', name: 'bill_type' })
  billType: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  title: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'receipt_image_path' })
  receiptImagePath: string | null;

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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'room_rent_amount' })
  roomRentAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'electric_unit_price' })
  electricUnitPrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'water_unit_price' })
  waterUnitPrice: number | null;

  @Column({ default: false })
  is_paid: boolean;

  @Column({ type: 'date', name: 'due_date', nullable: true })
  dueDate: Date | null;

  @ManyToOne(() => Room, (room) => room.utilityBills, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: Room | null;

  @OneToMany(() => UtilityBillShare, (share) => share.bill)
  shares: UtilityBillShare[];
}