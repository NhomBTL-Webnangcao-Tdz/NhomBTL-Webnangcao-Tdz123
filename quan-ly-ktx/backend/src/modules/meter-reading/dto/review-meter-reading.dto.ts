import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ReviewMeterReadingDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsInt()
  @Min(0)
  electricReading?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  waterReading?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}
