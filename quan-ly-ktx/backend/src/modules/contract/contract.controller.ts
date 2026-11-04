import { Controller, Get, Post, Body, Param, ParseIntPipe, Put, Delete, UseGuards } from '@nestjs/common';
import { ContractService } from './contract.service';
import { Contract } from './contract.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { Role } from '../../common/role.enum';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

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
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Contract | null> {
    return this.contractService.findOne(id);
  }

  @Post()
  async create(@Body() contractData: CreateContractDto): Promise<Contract> {
    return this.contractService.create(contractData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() contractData: UpdateContractDto,
  ): Promise<Contract | null> {
    return this.contractService.update(id, contractData);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.contractService.remove(id);
  }
}