import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateUtilityBillDto } from '../../../../../src/modules/utility-bill/dto/create-utility-bill.dto';
import { UpdateSharePaymentDto } from '../../../../../src/modules/utility-bill/dto/update-share-payment.dto';
import { UpdateUtilityBillDto } from '../../../../../src/modules/utility-bill/dto/update-utility-bill.dto';

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
const check = (metatype: new () => object, body: unknown) => pipe.transform(body, { type: 'body', metatype });

const validBody = {
  room: { id: 'test-room-01' },
  dueDate: '2026-12-10',
  month: 11,
  year: 2026,
  old_electric_index: 100,
  new_electric_index: 150,
  old_water_index: 10,
  new_water_index: 12,
  is_paid: false,
};

describe('UtilityBill DTO', () => {
  it('nhận đúng body BillForm gửi', async () => {
    await expect(check(CreateUtilityBillDto, validBody)).resolves.toMatchObject({ month: 11, year: 2026 });
  });

  it('cho phép chưa có phòng và chưa có hạn thanh toán', async () => {
    await expect(check(CreateUtilityBillDto, { ...validBody, room: null, dueDate: null })).resolves.toBeDefined();
  });

  it.each([
    ['tháng 13', { ...validBody, month: 13 }],
    ['năm quá nhỏ', { ...validBody, year: 1999 }],
    ['chỉ số âm', { ...validBody, old_water_index: -1 }],
    ['chỉ số điện mới nhỏ hơn cũ', { ...validBody, new_electric_index: 99 }],
    ['chỉ số nước mới nhỏ hơn cũ', { ...validBody, new_water_index: 9 }],
    ['total_amount do client gửi', { ...validBody, total_amount: 1 }],
    ['ngày sai', { ...validBody, dueDate: '10/12/2026' }],
    ['trường lạ receiptImagePath', { ...validBody, receiptImagePath: '../../.env' }],
    ['trường lạ bill_id', { ...validBody, bill_id: 1 }],
  ])('từ chối khi %s', async (_name, body) => {
    await expect(check(CreateUtilityBillDto, body)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cập nhật được một phần', async () => {
    await expect(check(UpdateUtilityBillDto, { is_paid: true })).resolves.toMatchObject({ is_paid: true });
  });

  it('isPaid phải là boolean', async () => {
    await expect(check(UpdateSharePaymentDto, { isPaid: true })).resolves.toMatchObject({ isPaid: true });
    await expect(check(UpdateSharePaymentDto, { isPaid: 'true' })).rejects.toBeInstanceOf(BadRequestException);
  });
});
