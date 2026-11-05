import { IsDateString } from 'class-validator';

export class RenewContractDto {
  @IsDateString()
  end_date: string;
}
