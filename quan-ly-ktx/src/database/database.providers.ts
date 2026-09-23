import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'mysql-36463a24-webnangcao1.a.aivencloud.com',
        port: 18485,
        username: 'avnadmin',
        password: 'AVNS_vkBu0JkD5O_vWc0RGMR',
        database: 'defaultdb',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      });
      return dataSource.initialize();
    },
  },
];