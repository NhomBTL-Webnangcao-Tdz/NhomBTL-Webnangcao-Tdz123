import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

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

export class ContractStudentRefDto {
  @IsString()
  @Length(1, 15)
  sid: string;
}

export class ContractRoomRefDto {
  @IsString()
  @Length(1, 36)
  id: string;
}

export class CreateContractDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => ContractStudentRefDto)
  student: ContractStudentRefDto;

  // room = null nghĩa là hợp đồng chưa xếp phòng.
  @IsOptional()
  @ValidateNested()
  @Type(() => ContractRoomRefDto)
  room?: ContractRoomRefDto | null;

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
