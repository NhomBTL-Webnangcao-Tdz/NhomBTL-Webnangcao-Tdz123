import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomListQueryDto } from './dto/room-list-query.dto';
import { isPaged, likePattern, pageWindow, PagedResult } from '../../common/list-query.dto';

@Injectable()
export class RoomService {
  constructor(
    @Inject('ROOM_REPOSITORY')
    private readonly roomRepository: Repository<Room>,
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

  // Sửa
  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    Object.assign(room, updateRoomDto);
    return await this.roomRepository.save(room);
  }

  // Xóa
  async remove(id: string): Promise<void> {
    const room = await this.findOne(id);
    await this.roomRepository.remove(room);
  }
}