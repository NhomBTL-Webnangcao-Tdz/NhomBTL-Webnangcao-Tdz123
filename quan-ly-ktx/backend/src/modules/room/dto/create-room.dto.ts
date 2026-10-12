import { IsString, IsInt, IsNumber, Min, IsOptional, Max } from 'class-validator';
export class CreateRoomDto {
  @IsString()
  roomNumber: string;
  @IsString()
  building: string;
  @IsInt()
  @Min(1)
  @Max(10)
  maxCapacity: number;
  @IsNumber()
  @Min(0)
  price: number;
}