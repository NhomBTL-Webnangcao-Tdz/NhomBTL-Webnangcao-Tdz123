import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DataSource, EntityManager } from 'typeorm';
import { AppModule } from '../app.module';
import { User } from '../auth/entities/user.entity';
import { Role } from '../common/role.enum';
import { Contract } from '../modules/contract/contract.entity';
import {
  calculateMonthlyBillAmount,
  calculateUtilityAmount,
  getNextMonthPaymentDate,
  splitUtilityAmount,
} from '../modules/meter-reading/meter-reading-calculations';
import { Room } from '../modules/room/room.entity';
import { Student } from '../modules/student/student.entity';
import { UtilityBill } from '../modules/utility-bill/utility-bill.entity';
import { UtilityBillShare } from '../modules/utility-bill/utility-bill-share.entity';
import { UtilityTariff } from '../modules/utility-bill/utility-tariff.entity';

// Dữ liệu demo, dễ nhận ra qua tiền tố demo_ / DEMO. Chạy: npm run seed
const ELECTRIC_PRICE = 3500;
const WATER_PRICE = 15000;

const roomSeeds = [
  { roomNumber: 'A101', building: 'Tòa A', maxCapacity: 4, price: 1200000 },
  { roomNumber: 'A102', building: 'Tòa A', maxCapacity: 4, price: 1200000 },
  { roomNumber: 'A201', building: 'Tòa A', maxCapacity: 2, price: 1800000 },
  { roomNumber: 'B101', building: 'Tòa B', maxCapacity: 4, price: 1000000 },
  { roomNumber: 'B102', building: 'Tòa B', maxCapacity: 6, price: 900000 },
];

// room: chỉ số trong roomSeeds. Phòng B102 để trống.
const studentSeeds = [
  { sid: 'DEMO01', room: 0 },
  { sid: 'DEMO02', room: 0 },
  { sid: 'DEMO03', room: 1 },
  { sid: 'DEMO04', room: 2 },
  { sid: 'DEMO05', room: 3 },
  { sid: 'DEMO06', room: null },
];

function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function createBill(
  manager: EntityManager,
  room: Room,
  sids: string[],
  period: { month: number; year: number },
  readings: { electric: [number, number]; water: [number, number] },
  isPaid: boolean,
) {
  const utilityAmount = calculateUtilityAmount(
    readings.electric[0], readings.electric[1],
    readings.water[0], readings.water[1],
    ELECTRIC_PRICE, WATER_PRICE,
  );
  const roomRentAmount = Number(room.price);
  const totalAmount = calculateMonthlyBillAmount(utilityAmount, roomRentAmount);
  const bill = await manager.save(manager.create(UtilityBill, {
    room,
    month: period.month,
    year: period.year,
    old_electric_index: readings.electric[0],
    new_electric_index: readings.electric[1],
    old_water_index: readings.water[0],
    new_water_index: readings.water[1],
    electricUnitPrice: ELECTRIC_PRICE,
    waterUnitPrice: WATER_PRICE,
    total_amount: totalAmount,
    roomRentAmount,
    is_paid: isPaid,
    dueDate: getNextMonthPaymentDate(period.year, period.month),
  }));
  const rentBySid = new Map(splitUtilityAmount(roomRentAmount, sids).map((share) => [share.sid, share.amount]));
  await manager.save(splitUtilityAmount(totalAmount, sids).map((share) => manager.create(UtilityBillShare, {
    bill,
    student: { sid: share.sid },
    amount: share.amount,
    roomRentAmount: rentBySid.get(share.sid) ?? 0,
    isPaid,
  })));
}

async function seed(dataSource: DataSource, password: string) {
  const hashedPassword = await bcrypt.hash(password, 12);
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const period = (date: Date) => ({ month: date.getMonth() + 1, year: date.getFullYear() });

  await dataSource.transaction(async (manager) => {
    await manager.save(manager.create(UtilityTariff, { id: 1, electricPrice: ELECTRIC_PRICE, waterPrice: WATER_PRICE }));

    const rooms = await manager.save(roomSeeds.map((room) => manager.create(Room, {
      ...room,
      currentOccupancy: studentSeeds.filter((student) => student.room === roomSeeds.indexOf(room)).length,
    })));

    await manager.save(studentSeeds.map((student, index) => manager.create(Student, {
      sid: student.sid,
      sname: `Sinh viên Demo ${index + 1}`,
      email: `${student.sid.toLowerCase()}@example.test`,
      phone: `090000000${index + 1}`,
    })));

    await manager.save([
      manager.create(User, { username: 'demo_admin', password: hashedPassword, role: Role.ADMIN }),
      manager.create(User, { username: 'demo_manager', password: hashedPassword, role: Role.MANAGER }),
      manager.create(User, { username: 'demo_student', password: hashedPassword, role: Role.STUDENT, studentSid: 'DEMO01' }),
    ]);

    // DEMO03 có hợp đồng sắp hết hạn; DEMO06 có hợp đồng đã thanh lý.
    const contracts = studentSeeds.map((student) => {
      const assigned = student.room !== null;
      const endDate = student.sid === 'DEMO03' ? addDays(today, 20) : addDays(today, assigned ? 240 : -30);
      return manager.create(Contract, {
        student: { sid: student.sid },
        room: assigned ? rooms[student.room as number] : rooms[4],
        start_date: toDateString(addDays(today, -60)) as unknown as Date,
        end_date: toDateString(endDate) as unknown as Date,
        deposit_amount: 1000000,
        is_active: assigned,
      });
    });
    await manager.save(contracts);

    for (const [index, room] of rooms.entries()) {
      const sids = studentSeeds.filter((student) => student.room === index).map((student) => student.sid);
      if (!sids.length) continue;
      const electric = 1000 + index * 100;
      const water = 100 + index * 10;
      await createBill(manager, room, sids, period(twoMonthsAgo), { electric: [electric, electric + 80], water: [water, water + 6] }, true);
      await createBill(manager, room, sids, period(lastMonth), { electric: [electric + 80, electric + 170], water: [water + 6, water + 13] }, false);
    }
  });
}

async function main() {
  const password = process.env.SEED_DEMO_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error('Cần đặt SEED_DEMO_PASSWORD (ít nhất 8 ký tự) trong .env trước khi seed.');
  }
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
  try {
    const dataSource = app.get<DataSource>('DATA_SOURCE', { strict: false });
    const existing = await dataSource.getRepository(User).findOneBy({ username: 'demo_admin' });
    if (existing) {
      console.log('Dữ liệu demo đã có, không seed lại.');
      return;
    }
    await seed(dataSource, password);
    console.log('Đã tạo dữ liệu demo: 5 phòng, 6 sinh viên, 6 hợp đồng, 8 hóa đơn, 3 tài khoản demo_*.');
  } finally {
    await app.close();
  }
}

// Thoát rõ ràng vì connection pool của DataSource giữ tiến trình chạy tiếp.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(`Seed thất bại: ${error.message}`);
    process.exit(1);
  });
