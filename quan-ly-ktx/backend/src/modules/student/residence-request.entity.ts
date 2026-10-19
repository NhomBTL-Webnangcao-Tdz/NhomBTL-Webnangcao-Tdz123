import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from './student.entity';

export enum ResidenceRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('residence_requests')
@Index('idx_residence_requests_status', ['status'])
@Index('idx_residence_requests_student_date', ['student', 'requestedAt'])
export class ResidenceRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_sid' })
  student: Student;

  @Column({ type: 'enum', enum: ResidenceRequestStatus, default: ResidenceRequestStatus.PENDING })
  status: ResidenceRequestStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'review_note' })
  reviewNote: string | null;

  @Column({ type: 'int', nullable: true, name: 'reviewed_by' })
  reviewedBy: number | null;

  @CreateDateColumn({ type: 'datetime', name: 'requested_at' })
  requestedAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'reviewed_at' })
  reviewedAt: Date | null;
}
