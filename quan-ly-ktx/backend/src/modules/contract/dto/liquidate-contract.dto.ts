import { IsDateString, IsOptional } from 'class-validator';

export class LiquidateContractDto {
  @IsOptional()
  @IsDateString()
  end_date?: string;
}
