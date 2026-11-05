import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { Contract } from './contract.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { Role } from '../../common/role.enum';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { RenewContractDto } from './dto/renew-contract.dto';
import { LiquidateContractDto } from './dto/liquidate-contract.dto';

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
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Contract> {
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
  ): Promise<Contract> {
    return this.contractService.update(id, contractData);
  }

  @Patch(':id/end')
  async terminate(@Param('id', ParseIntPipe) id: number): Promise<Contract> {
    return this.contractService.terminate(id);
  }

  @Patch(':id/renew')
  async renew(
    @Param('id', ParseIntPipe) id: number,
    @Body() details: RenewContractDto,
  ): Promise<Contract> {
    return this.contractService.renew(id, details);
  }

  @Patch(':id/liquidate')
  async liquidate(
    @Param('id', ParseIntPipe) id: number,
    @Body() details: LiquidateContractDto,
  ): Promise<Contract> {
    return this.contractService.liquidate(id, details);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.contractService.remove(id);
  }
}