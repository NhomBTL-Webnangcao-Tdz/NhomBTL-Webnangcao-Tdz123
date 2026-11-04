import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateContractDto } from '../../../../../src/modules/contract/dto/create-contract.dto';
import { UpdateContractDto } from '../../../../../src/modules/contract/dto/update-contract.dto';

// Cấu hình giống ValidationPipe toàn cục trong main.ts.
const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });

const validBody = {
  student: { sid: 'test-sv-01' },
  room: { id: 'test-room-01' },
  start_date: '2026-09-01',
  end_date: '2027-06-30',
  deposit_amount: 500000,
  is_active: true,
};

const check = (metatype: typeof CreateContractDto | typeof UpdateContractDto, body: unknown) =>
  pipe.transform(body, { type: 'body', metatype });

describe('Contract DTO', () => {
  it('nhận đúng body frontend gửi khi tạo hợp đồng', async () => {
    await expect(check(CreateContractDto, validBody)).resolves.toMatchObject({
      student: { sid: 'test-sv-01' },
      deposit_amount: 500000,
    });
  });

  it('cho phép hợp đồng chưa xếp phòng', async () => {
    await expect(check(CreateContractDto, { ...validBody, room: null })).resolves.toMatchObject({ room: null });
  });

  it.each([
    ['thiếu sinh viên', { ...validBody, student: undefined }],
    ['sid rỗng', { ...validBody, student: { sid: '' } }],
    ['sai định dạng ngày', { ...validBody, start_date: '01/09/2026' }],
    ['ngày không có thật', { ...validBody, end_date: '2027-02-30' }],
    ['ngày kết thúc trước ngày bắt đầu', { ...validBody, end_date: '2026-08-31' }],
    ['tiền cọc âm', { ...validBody, deposit_amount: -1 }],
    ['tiền cọc là chuỗi', { ...validBody, deposit_amount: '500000' }],
    ['tiền cọc vượt cột decimal(10,2)', { ...validBody, deposit_amount: 100000000 }],
    ['is_active không phải boolean', { ...validBody, is_active: 'true' }],
  ])('từ chối khi %s', async (_name, body) => {
    await expect(check(CreateContractDto, body)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('chặn gán thêm trường lạ (mass assignment)', async () => {
    await expect(check(CreateContractDto, { ...validBody, contract_id: 99 })).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      check(CreateContractDto, { ...validBody, student: { sid: 'test-sv-01', role: 'ADMIN' } }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cập nhật được một phần, ví dụ thanh lý hợp đồng', async () => {
    await expect(check(UpdateContractDto, { is_active: false })).resolves.toMatchObject({ is_active: false });
  });

  it('vẫn kiểm tra dữ liệu khi cập nhật', async () => {
    await expect(check(UpdateContractDto, { deposit_amount: -1 })).rejects.toBeInstanceOf(BadRequestException);
  });
});
