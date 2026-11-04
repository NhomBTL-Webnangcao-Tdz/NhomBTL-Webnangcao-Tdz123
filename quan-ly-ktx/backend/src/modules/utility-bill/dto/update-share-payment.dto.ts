import { IsBoolean } from 'class-validator';

export class UpdateSharePaymentDto {
  @IsBoolean()
  isPaid: boolean;
}
