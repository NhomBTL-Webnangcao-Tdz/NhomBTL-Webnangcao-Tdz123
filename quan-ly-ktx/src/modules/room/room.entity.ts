import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
@Entity()
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
}
