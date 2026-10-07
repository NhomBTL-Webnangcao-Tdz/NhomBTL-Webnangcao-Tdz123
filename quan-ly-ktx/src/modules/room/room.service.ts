import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

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
  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find();
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