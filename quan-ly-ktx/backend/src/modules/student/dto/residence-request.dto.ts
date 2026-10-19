import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ResidenceRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
