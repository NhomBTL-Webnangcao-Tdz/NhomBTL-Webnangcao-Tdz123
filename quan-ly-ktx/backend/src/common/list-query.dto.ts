import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

const DEFAULT_LIMIT = 20;

/** Không gửi page thì trả mảng như cũ để các trang đang dùng không phải sửa. */
export function isPaged(query: ListQueryDto): boolean {
  return query.page !== undefined;
}

export function pageWindow(query: ListQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? DEFAULT_LIMIT;
  return { page, limit, skip: (page - 1) * limit };
}

/** Thoát ký tự đại diện để từ khóa như "50%" được tìm đúng nghĩa đen. */
export function likePattern(keyword: string): string {
  return `%${keyword.trim().replace(/[\\%_]/g, '\\$&')}%`;
}
