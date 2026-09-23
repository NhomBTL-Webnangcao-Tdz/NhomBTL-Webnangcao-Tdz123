import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, } from 'typeorm';

import { Contract } from '../contract/contract.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  payment_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'datetime' })
  payment_date: Date;

  @Column({ length: 50 })
  payment_type: string;

  @ManyToOne(() => Contract, (contract) => contract.payments)
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;
}