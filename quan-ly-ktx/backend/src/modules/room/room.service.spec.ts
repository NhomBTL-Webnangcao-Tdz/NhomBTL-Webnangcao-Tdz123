import { DataSource, Repository } from 'typeorm';
import { Room } from './room.entity';
import { RoomService } from './room.service';

describe('RoomService.findResidents', () => {
  function createService(room: Room | null) {
    const queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { sid: 'S001', sname: 'Nguyen Van A', phone: '0900000000', email: 'a@example.com' },
      ]),
    };
    const dataSource = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      }),
    };
    const roomRepository = {
      findOne: jest.fn().mockResolvedValue(room),
    };
    const service = new RoomService(
      roomRepository as unknown as Repository<Room>,
      dataSource as unknown as DataSource,
    );

    return { service, roomRepository, dataSource, queryBuilder };
  }

  it('returns only students with active contracts in the requested room today', async () => {
    const room = { id: 'room-1' } as Room;
    const { service, queryBuilder } = createService(room);

    const residents = await service.findResidents(room.id);

    expect(residents).toEqual([
      { sid: 'S001', sname: 'Nguyen Van A', phone: '0900000000', email: 'a@example.com' },
    ]);
    expect(queryBuilder.where).toHaveBeenCalledWith('room.id = :roomId', { roomId: room.id });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('contract.is_active = :isActive', { isActive: true });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'contract.start_date <= :today',
      expect.objectContaining({ today: expect.any(String) }),
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'contract.end_date >= :today',
      expect.objectContaining({ today: expect.any(String) }),
    );
    expect(queryBuilder.getRawMany).toHaveBeenCalledTimes(1);
  });

  describe('RoomService.updatePrices', () => {
    it('updates all submitted room prices atomically', async () => {
      const rooms = [
        { id: 'room-1', price: 100 },
        { id: 'room-2', price: 200 },
      ] as Room[];
      const roomRepository = {
        find: jest.fn().mockResolvedValue(rooms),
        save: jest.fn().mockImplementation((updatedRooms) => updatedRooms),
      };
      const manager = { getRepository: jest.fn().mockReturnValue(roomRepository) };
      const dataSource = {
        transaction: jest.fn((callback) => callback(manager)),
      };
      const service = new RoomService(
        {} as Repository<Room>,
        dataSource as unknown as DataSource,
      );

      const result = await service.updatePrices({
        rooms: [
          { id: 'room-1', price: 300 },
          { id: 'room-2', price: 400 },
        ],
      });

      expect(result.map((room) => room.price)).toEqual([300, 400]);
      expect(roomRepository.save).toHaveBeenCalledWith(rooms);
    });

    it('rejects the entire update if any room does not exist', async () => {
      const roomRepository = {
        find: jest.fn().mockResolvedValue([{ id: 'room-1', price: 100 }]),
        save: jest.fn(),
      };
      const dataSource = {
        transaction: jest.fn((callback) => callback({
          getRepository: jest.fn().mockReturnValue(roomRepository),
        })),
      };
      const service = new RoomService(
        {} as Repository<Room>,
        dataSource as unknown as DataSource,
      );

      await expect(service.updatePrices({
        rooms: [
          { id: 'room-1', price: 300 },
          { id: 'missing', price: 400 },
        ],
      })).rejects.toThrow('Một hoặc nhiều phòng không tồn tại');
      expect(roomRepository.save).not.toHaveBeenCalled();
    });
  });

  it('returns not found for a room that does not exist', async () => {
    const { service, dataSource } = createService(null);

    await expect(service.findResidents('missing')).rejects.toThrow('Không tìm thấy phòng');
    expect(dataSource.getRepository).not.toHaveBeenCalled();
  });
});
