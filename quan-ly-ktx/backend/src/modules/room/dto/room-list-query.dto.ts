import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ListQueryDto } from '../../../common/list-query.dto';

export class RoomListQueryDto extends ListQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  building?: string;

  // available: còn chỗ, full: đã đầy, empty: chưa có ai.
  @IsOptional()
  @IsIn(['available', 'full', 'empty'])
  status?: 'available' | 'full' | 'empty';
}
