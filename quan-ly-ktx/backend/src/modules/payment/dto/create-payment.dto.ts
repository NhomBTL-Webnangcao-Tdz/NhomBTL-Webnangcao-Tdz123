import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsString, Length, Min } from 'class-validator';

export class CreatePaymentDto {
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsDateString()
  payment_date: string;

  @IsString()
  @Length(1, 50)
  payment_type: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  contractId: number;
}
