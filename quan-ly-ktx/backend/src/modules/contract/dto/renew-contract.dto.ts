import { IsDateString } from 'class-validator';

export class RenewContractDto {
  @IsDateString({ strict: true })
  end_date: string;
}
