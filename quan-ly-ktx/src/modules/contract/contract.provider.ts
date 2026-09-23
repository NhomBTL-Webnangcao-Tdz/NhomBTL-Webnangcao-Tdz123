import { DataSource } from 'typeorm';
import { Contract } from './contract.entity';

export const contractProviders = [
  {
    provide: 'CONTRACT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Contract),
    inject: ['DATA_SOURCE'],
  },
];