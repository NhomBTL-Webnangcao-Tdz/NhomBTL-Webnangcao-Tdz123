import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { BillListQueryDto } from '../../../src/modules/utility-bill/dto/bill-list-query.dto';
import { RoomListQueryDto } from '../../../src/modules/room/dto/room-list-query.dto';
import { isPaged, likePattern, ListQueryDto, pageWindow } from '../../../src/common/list-query.dto';

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
const check = (metatype: new () => object, query: unknown) => pipe.transform(query, { type: 'query', metatype });

describe('Tham số danh sách', () => {
  it('đổi page, limit từ chuỗi sang số', async () => {
    await expect(check(ListQueryDto, { page: '2', limit: '5' })).resolves.toMatchObject({ page: 2, limit: 5 });
  });

  it.each([
    ['page 0', ListQueryDto, { page: '0' }],
    ['limit quá lớn', ListQueryDto, { limit: '101' }],
    ['page không phải số', ListQueryDto, { page: 'abc' }],
    ['tham số lạ', ListQueryDto, { sort: 'password' }],
    ['status phòng sai', RoomListQueryDto, { status: 'x' }],
    ['tháng 13', BillListQueryDto, { month: '13' }],
    ['status hóa đơn sai', BillListQueryDto, { status: 'x' }],
  ])('từ chối %s', async (_name, metatype, query) => {
    await expect(check(metatype, query)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('không có page thì trả mảng như cũ', () => {
    expect(isPaged({ q: 'a' })).toBe(false);
    expect(isPaged({ page: 1 })).toBe(true);
  });

  it('tính vị trí trang, mặc định 20 dòng', () => {
    expect(pageWindow({ page: 3, limit: 10 })).toEqual({ page: 3, limit: 10, skip: 20 });
    expect(pageWindow({})).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it('thoát ký tự đại diện của LIKE', () => {
    expect(likePattern(' 50%_a ')).toBe('%50\\%\\_a%');
  });
});
