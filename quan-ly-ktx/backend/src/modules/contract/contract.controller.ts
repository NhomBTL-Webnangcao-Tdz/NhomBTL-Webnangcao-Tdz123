import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ContractService } from './contract.service';
import { Contract } from './contract.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { Role } from '../../common/role.enum';

@Controller('contract')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
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
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    return this.contractService.remove(+id);
  }
}