import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UtilityBillService } from './utility-bill.service';
import { UtilityBill } from './utility-bill.entity';

@Controller('utility-bill')
export class UtilityBillController {
  constructor(private readonly utilityBillService: UtilityBillService) {}

  @Get()
  async findAll(): Promise<UtilityBill[]> {
    return this.utilityBillService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UtilityBill | null> {
    return this.utilityBillService.findOne(+id);
  }

  @Post()
  async create(@Body() utilityBillData: Partial<UtilityBill>): Promise<UtilityBill> {
    return this.utilityBillService.create(utilityBillData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() utilityBillData: Partial<UtilityBill>): Promise<UtilityBill | null> {
    return this.utilityBillService.update(+id, utilityBillData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.utilityBillService.remove(+id);
  }
}