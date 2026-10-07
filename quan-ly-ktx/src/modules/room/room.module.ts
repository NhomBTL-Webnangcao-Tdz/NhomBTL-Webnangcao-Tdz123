import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { roomProviders } from './room.provider';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';

@Module({
  imports: [DatabaseModule], // Dùng DatabaseModule (DataSource pattern) thay vì TypeOrmModule.forFeature
  controllers: [RoomController],
  providers: [
    ...roomProviders, // ROOM_REPOSITORY
    RoomService,
  ],
  exports: [RoomService],
})
export class RoomModule {}