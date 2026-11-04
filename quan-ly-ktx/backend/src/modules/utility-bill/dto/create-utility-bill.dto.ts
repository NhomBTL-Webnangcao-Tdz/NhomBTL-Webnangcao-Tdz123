import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
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

@ValidatorConstraint({ name: 'newIndexNotBelowOld' })
class NewIndexNotBelowOld implements ValidatorConstraintInterface {
  validate(newIndex: number, args: ValidationArguments): boolean {
    const oldIndex = (args.object as Record<string, unknown>)[args.constraints[0] as string];
    if (typeof oldIndex !== 'number' || typeof newIndex !== 'number') return true;
    return newIndex >= oldIndex;
  }

  defaultMessage(): string {
    return 'Chỉ số mới không được nhỏ hơn chỉ số cũ.';
  }
}

export class BillRoomRefDto {
  @IsString()
  @Length(1, 36)
  id: string;
}

export class CreateUtilityBillDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BillRoomRefDto)
  room?: BillRoomRefDto | null;

  @IsOptional()
  @IsDateString({ strict: true })
  dueDate?: string | null;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsInt()
  @Min(0)
  old_electric_index: number;

  @IsInt()
  @Min(0)
  @Validate(NewIndexNotBelowOld, ['old_electric_index'])
  new_electric_index: number;

  @IsInt()
  @Min(0)
  old_water_index: number;

  @IsInt()
  @Min(0)
  @Validate(NewIndexNotBelowOld, ['old_water_index'])
  new_water_index: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  total_amount: number;

  @IsOptional()
  @IsBoolean()
  is_paid?: boolean;
}
