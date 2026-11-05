import { IsDateString, IsOptional } from 'class-validator';

export class LiquidateContractDto {
  @IsOptional()
  @IsDateString({ strict: true })
  end_date?: string;
}
