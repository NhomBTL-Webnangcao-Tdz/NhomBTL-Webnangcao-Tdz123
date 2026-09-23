import { DataSource } from 'typeorm';
import { UtilityBill } from './utility-bill.entity';

export const utilityBillProviders = [
  {
    provide: 'UTILITY_BILL_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UtilityBill),
    inject: ['DATA_SOURCE'],
  },
];