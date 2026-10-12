import { DataSource } from 'typeorm';
import { Room } from './room.entity';

export const roomProviders = [
  {
    provide: 'ROOM_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Room),
    inject: ['DATA_SOURCE'],
  },
];

