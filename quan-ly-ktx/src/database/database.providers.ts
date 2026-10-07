import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'mysql-1f51fb76-tandz1-aiven.i.aivencloud.com',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 10148,
        username: process.env.DB_USERNAME || 'avnadmin',
        password: process.env.DB_PASSWORD || 'AVNS_TXFt18qElRZxv_UFofi',
        database: process.env.DB_NAME || 'thuc_hanh_security',
        // Glob pattern tự động load tất cả entity (bao gồm User entity của auth)
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true, // Tự động tạo/cập nhật bảng theo Entity (chỉ dùng khi dev)
        // ssl: bắt buộc khi kết nối Aiven
        ssl: {
          rejectUnauthorized: false,
        },
        logging: false,
      });
      return dataSource.initialize();
    },
  },
];