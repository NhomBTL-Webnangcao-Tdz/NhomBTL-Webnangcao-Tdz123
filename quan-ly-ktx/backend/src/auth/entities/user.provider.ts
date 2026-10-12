import { DataSource } from 'typeorm';
import { User } from './user.entity';

/**
 * userProviders - Cung cấp User Repository theo pattern DataSource thủ công của project
 */
export const userProviders = [
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATA_SOURCE'],
  },
];

