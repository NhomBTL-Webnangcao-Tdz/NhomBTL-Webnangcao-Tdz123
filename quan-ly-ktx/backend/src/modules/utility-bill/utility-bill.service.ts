import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UtilityBill } from './utility-bill.entity';

@Injectable()
export class UtilityBillService {
  constructor(
    @Inject('UTILITY_BILL_REPOSITORY')
    private utilityBillRepository: Repository<UtilityBill>,
  ) {}

  async findAll(): Promise<UtilityBill[]> {
    return this.utilityBillRepository.find();
  }

  async findOne(id: number): Promise<UtilityBill | null> {
    return this.utilityBillRepository.findOneBy({ bill_id: id });
  }

  async create(utilityBillData: Partial<UtilityBill>): Promise<UtilityBill> {
    const newBill = this.utilityBillRepository.create(utilityBillData);
    return this.utilityBillRepository.save(newBill);
  }

  async update(id: number, utilityBillData: Partial<UtilityBill>): Promise<UtilityBill | null> {
    await this.utilityBillRepository.update(id, utilityBillData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.utilityBillRepository.delete(id);
  }
}