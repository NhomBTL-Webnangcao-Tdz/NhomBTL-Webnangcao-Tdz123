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
    return this.contractRepository.find({ relations: { student: true, room: true } });
  }

  async findOne(id: number): Promise<Contract | null> {
    return this.contractRepository.findOne({
      where: { contract_id: id },
      relations: { student: true, room: true },
    });
  }

  async create(contractData: Partial<Contract>): Promise<Contract> {
    const newContract = this.contractRepository.create(contractData);
    return this.contractRepository.save(newContract);
  }

  async update(id: number, contractData: Partial<Contract>): Promise<Contract | null> {
    const contract = await this.contractRepository.findOneBy({ contract_id: id });
    if (!contract) return null;
    Object.assign(contract, contractData);
    await this.contractRepository.save(contract);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.contractRepository.delete(id);
  }
}