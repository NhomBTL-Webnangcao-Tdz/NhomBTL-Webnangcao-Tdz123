import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UtilityBill } from '../../src/modules/utility-bill/utility-bill.entity';
import { UtilityTariff } from '../../src/modules/utility-bill/utility-tariff.entity';
import { UtilityBillService } from '../../src/modules/utility-bill/utility-bill.service';

// US-18: lập hóa đơn. US-19: đánh dấu từng sinh viên đã đóng. Quy tắc R6, R9.
const baseBill = {
  bill_id: 1,
  month: 10,
  year: 2026,
  old_electric_index: 100,
  new_electric_index: 150,
  old_water_index: 10,
  new_water_index: 12,
  total_amount: 1000,
  is_paid: false,
  dueDate: '2020-01-10',
  room: { id: 'r1', roomNumber: 'A101', building: 'Tòa A' },
  shares: [],
};

const dto = {
  room: { id: 'r1' },
  month: 10,
  year: 2026,
  old_electric_index: 100,
  new_electric_index: 150,
  old_water_index: 10,
  new_water_index: 12,
};

function setup(found: object | null = baseBill, options: { duplicate?: boolean; unpaid?: number } = {}) {
  const repository = {
    create: jest.fn((bill) => bill),
    save: jest.fn((bill) => Promise.resolve(bill)),
    exists: jest.fn().mockResolvedValue(Boolean(options.duplicate)),
    findOne: jest.fn().mockResolvedValue(found),
    findOneBy: jest.fn().mockResolvedValue(found),
    delete: jest.fn().mockResolvedValue({ affected: found ? 1 : 0 }),
  };
  const share = { isPaid: false, bill: { bill_id: 1, is_paid: false } };
  const shares = {
    findOne: jest.fn().mockResolvedValue(share),
    save: jest.fn().mockResolvedValue(share),
    count: jest.fn().mockResolvedValue(options.unpaid ?? 0),
    find: jest.fn().mockResolvedValue([{ id: 1, isPaid: false }]),
  };
  const tariff = { id: 1, electricPrice: '3500.00', waterPrice: '20000.00' };
  const tariffRepository = { findOneBy: jest.fn().mockResolvedValue(tariff) };
  const bills = { save: jest.fn().mockResolvedValue({}) };
  const manager = { getRepository: jest.fn((entity) => (entity === UtilityBill ? bills : shares)) };
  const dataSource = {
    transaction: jest.fn((run) => run(manager)),
    getRepository: jest.fn((entity) => (
      entity === UtilityTariff ? tariffRepository : shares
    )),
  };
  const service = new UtilityBillService(
    repository as unknown as Repository<UtilityBill>,
    dataSource as unknown as DataSource,
  );
  return { service, repository, shares, bills, share, tariffRepository };
}

describe('US-18 UtilityBillService', () => {
  it('R8: tính tổng tiền trên server và lưu đơn giá tại thời điểm tạo', async () => {
    const { service, repository, tariffRepository } = setup();
    await service.create(dto);
    expect(tariffRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      total_amount: 215000,
      electricUnitPrice: 3500,
      waterUnitPrice: 20000,
    }));
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      total_amount: 215000,
    }));
  });

  it('không dùng total_amount giả mạo từ client', async () => {
    const { service, repository } = setup();
    await service.create({ ...dto, total_amount: 1 } as typeof dto);
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ total_amount: 215000 }));
  });

  it('từ chối tạo hóa đơn nếu chưa cấu hình đơn giá', async () => {
    const { service, repository, tariffRepository } = setup();
    tariffRepository.findOneBy.mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('R6: phòng đã có hóa đơn kỳ đó trả 409', async () => {
    const { service, repository } = setup(baseBill, { duplicate: true });
    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('hóa đơn chưa gắn phòng không kiểm tra trùng', async () => {
    const { service, repository } = setup();
    await service.create({ ...dto, room: null });
    expect(repository.exists).not.toHaveBeenCalled();
  });

  it('xem hóa đơn không tồn tại trả 404', async () => {
    const { service } = setup(null);
    await expect(service.findOne(9)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('sửa hóa đơn chưa thu', async () => {
    const { service, repository } = setup({ ...baseBill });
    await service.update(1, { new_electric_index: 160 });
    expect(repository.save).toHaveBeenCalled();
  });

  it('R9: hóa đơn đã thu không được sửa chỉ số', async () => {
    const { service, repository } = setup({ ...baseBill, is_paid: true });
    await expect(service.update(1, { new_electric_index: 160 })).rejects.toBeInstanceOf(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('R9: hóa đơn đã thu vẫn sửa được phần khác khi chỉ số không đổi', async () => {
    const { service, repository } = setup({ ...baseBill, is_paid: true });
    await service.update(1, { new_electric_index: 150, dueDate: '2026-12-01' });
    expect(repository.save).toHaveBeenCalled();
  });

  it('đánh dấu cả hóa đơn đã thu thì cập nhật mọi phần sinh viên', async () => {
    const { service, shares } = setup({ ...baseBill });
    await service.update(1, { is_paid: true });
    expect(shares.save).toHaveBeenCalledWith([expect.objectContaining({ isPaid: true })]);
  });

  it('xóa hóa đơn không tồn tại trả 404', async () => {
    const { service } = setup(null);
    await expect(service.remove(9)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('US-19 đánh dấu sinh viên đã đóng', () => {
  it('sinh viên cuối cùng đóng thì hóa đơn thành đã thu', async () => {
    const { service, bills, share } = setup(baseBill, { unpaid: 0 });
    await service.updateSharePayment(1, 'SV1', true);
    expect(share.isPaid).toBe(true);
    expect(bills.save).toHaveBeenCalledWith(expect.objectContaining({ is_paid: true }));
  });

  it('còn người chưa đóng thì hóa đơn vẫn chưa thu', async () => {
    const { service, bills } = setup(baseBill, { unpaid: 1 });
    await service.updateSharePayment(1, 'SV1', true);
    expect(bills.save).toHaveBeenCalledWith(expect.objectContaining({ is_paid: false }));
  });

  it('không có phần của sinh viên trả 404', async () => {
    const { service, shares } = setup();
    shares.findOne.mockResolvedValue(null);
    await expect(service.updateSharePayment(1, 'SV9', true)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('trạng thái không phải boolean bị từ chối', async () => {
    const { service } = setup();
    await expect(service.updateSharePayment(1, 'SV1', 'x' as unknown as boolean)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('không nhắc sinh viên đã đóng', async () => {
    const paid = { ...baseBill, shares: [{ isPaid: true, student: { sid: 'SV1' } }] };
    const { service } = setup(paid);
    await expect(service.remindStudent(1, 'SV1')).rejects.toBeInstanceOf(BadRequestException);
  });
});
