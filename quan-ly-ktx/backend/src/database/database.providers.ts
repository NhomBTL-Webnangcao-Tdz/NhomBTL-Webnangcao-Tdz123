import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Contract } from '../modules/contract/contract.entity';
import { Payment } from '../modules/payment/payment.entity';
import { Room } from '../modules/room/room.entity';
import { Student } from '../modules/student/student.entity';
import { UtilityBill } from '../modules/utility-bill/utility-bill.entity';
import { ResidenceRequest } from '../modules/student/residence-request.entity';
import { Notification } from '../modules/notification/notification.entity';
import { MeterReadingSubmission } from '../modules/meter-reading/meter-reading.entity';
import { UtilityTariff } from '../modules/utility-bill/utility-tariff.entity';
import { UtilityBillShare } from '../modules/utility-bill/utility-bill-share.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (configService: ConfigService) => {
      const port = Number(configService.get('DB_PORT', '3306'));
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('DB_PORT phải là số cổng hợp lệ từ 1 đến 65535.');
      }

      const synchronizeSetting = configService.get<string>('DB_SYNCHRONIZE');
      const sslEnabled = configService.get('DB_SSL') === 'true';
      const sslCaPath = configService.get<string>('DB_SSL_CA');
      const ssl = sslEnabled
        ? {
            rejectUnauthorized: configService.get('DB_SSL_REJECT_UNAUTHORIZED') !== 'false',
            ...(sslCaPath
              ? { ca: readFileSync(resolve(process.cwd(), sslCaPath), 'utf8') }
              : {}),
          }
        : undefined;

      const dataSource = new DataSource({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port,
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'quan_ly_ktx'),
        entities: [
          User, Room, Student, Contract, UtilityBill, Payment, ResidenceRequest, Notification,
          MeterReadingSubmission, UtilityTariff, UtilityBillShare,
        ],
        synchronize: synchronizeSetting
          ? synchronizeSetting === 'true'
          : configService.get('NODE_ENV') !== 'production',
        ssl,
        logging: false,
      });
      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
