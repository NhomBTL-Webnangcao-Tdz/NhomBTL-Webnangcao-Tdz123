import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ContractService } from './contract.service';
import { Contract } from './contract.entity';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get()
  async findAll(): Promise<Contract[]> {
    return this.contractService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Contract | null> {
    return this.contractService.findOne(+id);
  }

  @Post()
  async create(@Body() contractData: Partial<Contract>): Promise<Contract> {
    return this.contractService.create(contractData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() contractData: Partial<Contract>): Promise<Contract | null> {
    return this.contractService.update(+id, contractData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.contractService.remove(+id);
  }
}