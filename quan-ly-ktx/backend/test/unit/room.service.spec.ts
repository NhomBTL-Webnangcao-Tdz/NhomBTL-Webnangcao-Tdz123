import { NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Room } from '../../src/modules/room/room.entity';
import { RoomService } from '../../src/modules/room/room.service';

// US-14: cán bộ thêm, sửa, xóa, xem phòng.
function setup(found: Partial<Room> | null = { id: 'r1', roomNumber: 'A101', price: 100 }) {
  const builder = {
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([found]),
    getManyAndCount: jest.fn().mockResolvedValue([[found], 7]),
  };
  const repository = {
    create: jest.fn((room) => room),
    save: jest.fn((room) => Promise.resolve(room)),
    findOne: jest.fn().mockResolvedValue(found),
    remove: jest.fn().mockResolvedValue(undefined),
    createQueryBuilder: jest.fn(() => builder),
  };
  return { repository, builder, service: new RoomService(repository as unknown as Repository<Room>, {} as DataSource) };
}

describe('US-14 RoomService', () => {
  it('thêm phòng', async () => {
    const { service, repository } = setup();
    const dto = { roomNumber: 'A102', building: 'Tòa A', maxCapacity: 4, price: 1000 };
    await expect(service.create(dto)).resolves.toMatchObject(dto);
    expect(repository.save).toHaveBeenCalled();
  });

  it('danh sách không có page trả mảng', async () => {
    const { service, builder } = setup();
    await expect(service.findAll()).resolves.toHaveLength(1);
    expect(builder.getManyAndCount).not.toHaveBeenCalled();
  });

  it('danh sách có page trả tổng số và tính đúng vị trí', async () => {
    const { service, builder } = setup();
    await expect(service.findAll({ page: 2, limit: 3 })).resolves.toMatchObject({ total: 7, page: 2, limit: 3 });
    expect(builder.skip).toHaveBeenCalledWith(3);
  });

  it('lọc theo tòa và phòng còn chỗ', async () => {
    const { service, builder } = setup();
    await service.findAll({ building: 'Tòa A', status: 'available' });
    expect(builder.andWhere).toHaveBeenCalledWith('room.building = :building', { building: 'Tòa A' });
    expect(builder.andWhere).toHaveBeenCalledWith('room.currentOccupancy < room.maxCapacity');
  });

  it('xem phòng không tồn tại trả 404', async () => {
    const { service } = setup(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('sửa phòng', async () => {
    const { service } = setup();
    await expect(service.update('r1', { price: 200 })).resolves.toMatchObject({ id: 'r1', price: 200 });
  });

  it('sửa phòng không tồn tại không ghi gì', async () => {
    const { service, repository } = setup(null);
    await expect(service.update('x', { price: 200 })).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
