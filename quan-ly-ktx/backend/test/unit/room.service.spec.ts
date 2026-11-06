import { NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Contract } from '../../src/modules/contract/contract.entity';
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

  it('chặn giảm sức chứa xuống dưới sĩ số hiện tại (R1)', async () => {
    const room = {
      id: 'r1',
      roomNumber: 'A101',
      maxCapacity: 4,
      currentOccupancy: 3,
    };
    const { service, repository } = setup(room);

    await expect(service.update('r1', { maxCapacity: 2 }))
      .rejects.toThrow('Sức chứa không thể thấp hơn sĩ số hiện tại.');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('chặn xóa phòng còn hợp đồng lưu trú đang hiệu lực (R5)', async () => {
    const room = { id: 'r1', roomNumber: 'A101', price: 100 } as Room;
    const roomRepository = {
      findOne: jest.fn().mockResolvedValue(room),
      remove: jest.fn(),
    };
    const contractQuery = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
    };
    const contractRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(contractQuery),
      count: jest.fn().mockResolvedValue(0),
    };
    const billRepository = { count: jest.fn().mockResolvedValue(0) };
    const dataSource = {
      getRepository: jest.fn((entity) => (
        entity === Contract ? contractRepository : billRepository
      )),
    };
    const service = new RoomService(
      roomRepository as unknown as Repository<Room>,
      dataSource as unknown as DataSource,
    );

    await expect(service.remove('r1')).rejects.toThrow('Không thể xóa phòng còn hợp đồng lưu trú.');

    expect(contractQuery.andWhere).toHaveBeenCalledWith(
      'contract.is_active = :isActive',
      { isActive: true },
    );
    expect(roomRepository.remove).not.toHaveBeenCalled();
  });
});
