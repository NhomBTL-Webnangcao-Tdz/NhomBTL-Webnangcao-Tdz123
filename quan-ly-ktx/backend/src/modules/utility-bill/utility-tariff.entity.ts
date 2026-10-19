import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('utility_tariff')
export class UtilityTariff {
  @PrimaryColumn({ type: 'int', default: 1 })
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'electric_price' })
  electricPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'water_price' })
  waterPrice: number;

  @Column({ type: 'int', name: 'updated_by', nullable: true })
  updatedBy: number | null;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
