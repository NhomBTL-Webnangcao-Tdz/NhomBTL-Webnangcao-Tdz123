import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';

@Injectable()
export class ContractService {
  constructor(
    @Inject('CONTRACT_REPOSITORY')
    private contractRepository: Repository<Contract>,
  ) {}

  async findAll(): Promise<Contract[]> {
    return this.contractRepository.find();
  }

  async findOne(id: number): Promise<Contract | null> {
    return this.contractRepository.findOneBy({ contract_id: id });
  }

  async create(contractData: Partial<Contract>): Promise<Contract> {
    const newContract = this.contractRepository.create(contractData);
    return this.contractRepository.save(newContract);
  }

  async update(id: number, contractData: Partial<Contract>): Promise<Contract | null> {
    await this.contractRepository.update(id, contractData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.contractRepository.delete(id);
  }
}