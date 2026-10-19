import { IsDateString, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class ApproveResidenceRequestDto {
  @IsString()
  @MaxLength(36)
  roomId: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  depositAmount: number;
}
