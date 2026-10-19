import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class SubmitMeterReadingDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  electricReading: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  waterReading: number;
}
