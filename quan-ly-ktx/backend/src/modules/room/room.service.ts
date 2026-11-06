import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomListQueryDto } from './dto/room-list-query.dto';
import { isPaged, likePattern, pageWindow, PagedResult } from '../../common/list-query.dto';
import { UpdateRoomPricesDto } from './dto/update-room-prices.dto';
import { Contract } from '../contract/contract.entity';
import { UtilityBill } from '../utility-bill/utility-bill.entity';

@Injectable()
export class RoomService {
  constructor(
    @Inject('ROOM_REPOSITORY')
    private readonly roomRepository: Repository<Room>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}

  // Thêm
  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const newRoom = this.roomRepository.create(createRoomDto);
    return await this.roomRepository.save(newRoom);
  }

  // Đọc tất cả
  async findAll(query: RoomListQueryDto = {}): Promise<Room[] | PagedResult<Room>> {
    const builder = this.roomRepository.createQueryBuilder('room').orderBy('room.building').addOrderBy('room.roomNumber');
    if (query.q?.trim()) {
      builder.andWhere('(room.roomNumber LIKE :q OR room.building LIKE :q)', { q: likePattern(query.q) });
    }
    if (query.building) builder.andWhere('room.building = :building', { building: query.building });
    if (query.status === 'available') builder.andWhere('room.currentOccupancy < room.maxCapacity');
    if (query.status === 'full') builder.andWhere('room.currentOccupancy >= room.maxCapacity');
    if (query.status === 'empty') builder.andWhere('room.currentOccupancy = 0');

    if (!isPaged(query)) return builder.getMany();
    const { page, limit, skip } = pageWindow(query);
    const [items, total] = await builder.skip(skip).take(limit).getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID: ${id}`);
    }
    return room;
  }

  async findResidents(id: string) {
    await this.findOne(id);
    const today = this.today();
    return this.dataSource.getRepository(Contract)
      .createQueryBuilder('contract')
      .innerJoin('contract.room', 'room')
      .innerJoin('contract.student', 'student')
      .select('student.sid', 'sid')
      .addSelect('student.sname', 'sname')
      .addSelect('student.phone', 'phone')
      .addSelect('student.email', 'email')
      .where('room.id = :roomId', { roomId: id })
      .andWhere('contract.is_active = :isActive', { isActive: true })
      .andWhere('contract.start_date <= :today', { today })
      .andWhere('contract.end_date >= :today', { today })
      .orderBy('student.sname', 'ASC')
      .getRawMany<{ sid: string; sname: string; phone: string; email: string }>();
  }

  private today(): string {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
  }

  // Sửa
  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    if (
      updateRoomDto.maxCapacity !== undefined
      && updateRoomDto.maxCapacity < room.currentOccupancy
    ) {
      throw new ConflictException('Sức chứa không thể thấp hơn sĩ số hiện tại.');
    }
    Object.assign(room, updateRoomDto);
    return await this.roomRepository.save(room);
  }

  async updatePrices({ rooms }: UpdateRoomPricesDto): Promise<Room[]> {
    return this.dataSource.transaction(async (manager) => {
      const roomRepository = manager.getRepository(Room);
      const roomIds = rooms.map(({ id }) => id);
      const existingRooms = await roomRepository.find({
        where: { id: In(roomIds) },
        lock: { mode: 'pessimistic_write' },
      });
      if (existingRooms.length !== roomIds.length) {
        throw new NotFoundException('Một hoặc nhiều phòng không tồn tại.');
      }

      const pricesById = new Map(rooms.map(({ id, price }) => [id, price]));
      for (const room of existingRooms) {
        const price = pricesById.get(room.id);
        if (price === undefined) {
          throw new BadRequestException('Giá phòng không hợp lệ.');
        }
        room.price = price;
      }
      return roomRepository.save(existingRooms);
    });
  }

  // Xóa
  async remove(id: string): Promise<void> {
    const room = await this.findOne(id);

    const contracts = this.dataSource.getRepository(Contract);
    const bills = this.dataSource.getRepository(UtilityBill);
    const [activeContractCount, contractHistoryCount, unpaidBillCount, billHistoryCount] = await Promise.all([
      contracts.createQueryBuilder('contract')
        .innerJoin('contract.room', 'room')
        .where('room.id = :roomId', { roomId: id })
        .andWhere('contract.is_active = :isActive', { isActive: true })
        .andWhere('contract.end_date >= CURRENT_DATE()')
        .getCount(),
      contracts.count({ where: { room: { id } } }),
      bills.count({ where: { room: { id }, is_paid: false } }),
      bills.count({ where: { room: { id } } }),
    ]);
    if (activeContractCount) {
      throw new ConflictException('Không thể xóa phòng còn hợp đồng lưu trú.');
    }
    if (unpaidBillCount) {
      throw new ConflictException('Không thể xóa phòng còn hóa đơn chưa thanh toán.');
    }
    if (contractHistoryCount) {
      throw new ConflictException('Không thể xóa phòng đang được lưu trong lịch sử hợp đồng.');
    }
    if (billHistoryCount) {
      throw new ConflictException('Không thể xóa phòng đang được lưu trong lịch sử hóa đơn.');
    }

    await this.roomRepository.remove(room);
  }
}