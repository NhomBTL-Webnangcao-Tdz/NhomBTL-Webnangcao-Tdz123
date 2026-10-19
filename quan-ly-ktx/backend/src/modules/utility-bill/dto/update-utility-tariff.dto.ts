import { Transform } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class UpdateUtilityTariffDto {
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  electricPrice: number;

  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  waterPrice: number;
}
