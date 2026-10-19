// src/modules/room/room.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Contract } from '../contract/contract.entity';
import { UtilityBill } from '../utility-bill/utility-bill.entity';

@Entity('rooms') 
export class Room extends BaseEntity {
  @Column({ name: 'room_number' })
  roomNumber: string;

  @Column()
  building: string;

  @Column({ name: 'max_capacity', type: 'int' })
  maxCapacity: number;

  @Column({ name: 'current_occupancy', type: 'int', default: 0 })
  currentOccupancy: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @OneToMany(() => Contract, (contract) => contract.room)
  contracts: Contract[];

  @OneToMany(() => UtilityBill, (bill) => bill.room)
  utilityBills: UtilityBill[];
}