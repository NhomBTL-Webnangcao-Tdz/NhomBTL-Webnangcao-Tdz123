import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from '../room/room.entity';

export enum MeterReadingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('meter_reading_submissions')
@Index('idx_meter_reading_room_period_status', ['room', 'year', 'month', 'status'])
@Index('idx_meter_reading_status_created', ['status', 'createdAt'])
export class MeterReadingSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ type: 'int', name: 'submitted_by' })
  submittedBy: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 255, name: 'electric_photo_path' })
  electricPhotoPath: string;

  @Column({ type: 'varchar', length: 255, name: 'water_photo_path' })
  waterPhotoPath: string;

  @Column({ type: 'int', name: 'electric_reading' })
  electricReading: number;

  @Column({ type: 'int', name: 'water_reading' })
  waterReading: number;

  @Column({ type: 'enum', enum: MeterReadingStatus, default: MeterReadingStatus.PENDING })
  status: MeterReadingStatus;

  @Column({ type: 'int', nullable: true, name: 'reviewed_by' })
  reviewedBy: number | null;

  @Column({ type: 'datetime', nullable: true, name: 'reviewed_at' })
  reviewedAt: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'review_note' })
  reviewNote: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;
}
