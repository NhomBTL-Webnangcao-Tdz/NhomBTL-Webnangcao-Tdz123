import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsDefined,
  IsNumber,
  IsOptional,
  Max,
  Min,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  RoomContractReferenceDto,
  StudentContractReferenceDto,
} from './contract-reference.dto';

@ValidatorConstraint({ name: 'endDateNotBeforeStart' })
class EndDateNotBeforeStart implements ValidatorConstraintInterface {
  validate(endDate: string, args: ValidationArguments): boolean {
    const startDate = (args.object as { start_date?: string }).start_date;
    if (!startDate || !endDate) return true;
    return endDate.slice(0, 10) >= startDate.slice(0, 10);
  }

  defaultMessage(): string {
    return 'Ngày kết thúc không được trước ngày bắt đầu.';
  }
}

export class CreateContractDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => StudentContractReferenceDto)
  student: StudentContractReferenceDto;

  // room = null nghĩa là hợp đồng chưa xếp phòng.
  @IsOptional()
  @ValidateNested()
  @Type(() => RoomContractReferenceDto)
  room?: RoomContractReferenceDto | null;

  @IsDateString({ strict: true })
  start_date: string;

  @IsDateString({ strict: true })
  @Validate(EndDateNotBeforeStart)
  end_date: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  deposit_amount: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
