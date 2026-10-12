import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Role } from '../../common/role.enum';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard) // Dùng JwtAuthGuard tùy chỉnh thay vì @nestjs/passport
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
  
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }
}