import { IsString, Length } from 'class-validator';

export class StudentContractReferenceDto {
  @IsString()
  @Length(1, 15)
  sid: string;
}

export class RoomContractReferenceDto {
  @IsString()
  @Length(1, 64)
  id: string;
}
