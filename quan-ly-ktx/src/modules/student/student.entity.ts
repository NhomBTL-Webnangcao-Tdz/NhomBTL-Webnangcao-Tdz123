import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Contract } from '../contract/contract.entity';

@Entity()
export class Student {
  @PrimaryColumn({ length: 15 })
  sid: string;

  @Column({ length: 50 })
  sname: string;

  @Column({ length: 50 })
  email: string;

  @Column({ length: 15 })
  phone: string;

  @OneToMany(() => Contract, (contract) => contract.student)
  contracts: Contract[];
}