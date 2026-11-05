import { DataSource } from 'typeorm';
import { Contract } from '../contract/contract.entity';
import { Payment } from './payment.entity';

export const paymentProviders = [
  {
    provide: 'PAYMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Payment),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CONTRACT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Contract),
    inject: ['DATA_SOURCE'],
  },
];