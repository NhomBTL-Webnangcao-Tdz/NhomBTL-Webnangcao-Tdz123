import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectResidenceRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}
