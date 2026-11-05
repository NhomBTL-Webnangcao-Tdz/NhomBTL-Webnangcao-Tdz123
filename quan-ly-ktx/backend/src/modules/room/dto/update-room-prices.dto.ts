import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class RoomPriceDto {
  @IsString()
  id: string;

  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;
}

export class UpdateRoomPricesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((room: RoomPriceDto) => room.id)
  @ValidateNested({ each: true })
  @Type(() => RoomPriceDto)
  rooms: RoomPriceDto[];
}
