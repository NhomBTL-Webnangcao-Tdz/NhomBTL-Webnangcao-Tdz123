import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsDefined,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  RoomContractReferenceDto,
  StudentContractReferenceDto,
} from './contract-reference.dto';

export class CreateContractDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => StudentContractReferenceDto)
  student: StudentContractReferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RoomContractReferenceDto)
  room?: RoomContractReferenceDto | null;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  deposit_amount: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
