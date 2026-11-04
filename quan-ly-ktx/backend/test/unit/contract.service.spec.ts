import { Repository } from 'typeorm';
import { Contract } from '../../src/modules/contract/contract.entity';
import { ContractService } from '../../src/modules/contract/contract.service';

// US-16: cán bộ lập và theo dõi hợp đồng. Quy tắc R1, R2, R4 thêm khi Nam xong 5.1, 5.2.
function setup(found: Partial<Contract> | null = { contract_id: 1, is_active: true }) {
  const repository = {
    find: jest.fn().mockResolvedValue([found]),
    findOne: jest.fn().mockResolvedValue(found),
    findOneBy: jest.fn().mockResolvedValue(found),
    create: jest.fn((contract) => contract),
    save: jest.fn((contract) => Promise.resolve(contract)),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  return { repository, service: new ContractService(repository as unknown as Repository<Contract>) };
}

const dto = {
  student: { sid: 'SV1' },
  room: { id: 'r1' },
  start_date: '2026-09-01',
  end_date: '2027-06-30',
  deposit_amount: 500000,
};

describe('US-16 ContractService', () => {
  it('danh sách kèm sinh viên và phòng', async () => {
    const { service, repository } = setup();
    await service.findAll();
    expect(repository.find).toHaveBeenCalledWith({ relations: { student: true, room: true } });
  });

  it('tạo hợp đồng', async () => {
    const { service, repository } = setup();
    await service.create(dto);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalled();
  });

  it('thanh lý hợp đồng', async () => {
    const { service, repository } = setup();
    await service.update(1, { is_active: false });
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ contract_id: 1, is_active: false }));
  });

  it('xóa hợp đồng', async () => {
    const { service, repository } = setup();
    await service.remove(1);
    expect(repository.delete).toHaveBeenCalledWith(1);
  });
});
