import { DataSource, Repository } from 'typeorm';
import { Student } from '../student/student.entity';
import { Room } from '../room/room.entity';
import { Contract } from './contract.entity';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';

describe('ContractService.create', () => {
  const contractInput: CreateContractDto = {
    student: { sid: 'S001' },
    room: { id: 'R01' },
    start_date: '2026-09-01',
    end_date: '2027-06-30',
    deposit_amount: 1000000,
  };

  function createService(overlapCounts: number[]) {
    const countQueue = [...overlapCounts];
    const contractQuery = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn(() => Promise.resolve(countQueue.shift() ?? 0)),
    };
    const contract = {
      contract_id: 12,
      student: { sid: 'S001' },
      room: { id: 'R01' },
      start_date: new Date('2026-09-01T00:00:00.000Z'),
      end_date: new Date('2027-06-30T00:00:00.000Z'),
      is_active: true,
    };
    const contractRepository = {
      createQueryBuilder: jest.fn(() => contractQuery),
      create: jest.fn((values) => values),
      save: jest.fn().mockResolvedValue({ contract_id: contract.contract_id }),
      findOne: jest.fn().mockResolvedValue(contract),
    };
    const studentRepository = {
      findOne: jest.fn().mockResolvedValue({ sid: 'S001' }),
    };
    const roomRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'R01', maxCapacity: 2 }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const manager = {
      getRepository: jest.fn((entity) => {
        if (entity === Student) return studentRepository;
        if (entity === Room) return roomRepository;
        return contractRepository;
      }),
    };
    const dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    };
    const service = new ContractService(
      contractRepository as unknown as Repository<Contract>,
      dataSource as unknown as DataSource,
    );

    return { service, contractRepository, roomRepository, contractQuery };
  }

  it('creates a contract and refreshes the room occupancy inside the transaction', async () => {
    const { service, contractRepository, roomRepository, contractQuery } = createService([0, 1, 1]);

    const result = await service.create(contractInput);

    expect(result.contract_id).toBe(12);
    expect(contractRepository.save).toHaveBeenCalledTimes(1);
    expect(contractQuery.getCount).toHaveBeenCalledTimes(3);
    expect(roomRepository.update).toHaveBeenCalledWith('R01', { currentOccupancy: 1 });
  });

  it('rejects a contract when the room has no remaining capacity', async () => {
    const { service, contractRepository } = createService([0, 2]);

    await expect(service.create(contractInput)).rejects.toThrow('Phòng đã đủ sức chứa');
    expect(contractRepository.save).not.toHaveBeenCalled();
  });

  it('rejects overlapping active contracts for the same student', async () => {
    const { service, contractRepository, contractQuery } = createService([1]);

    await expect(service.create(contractInput)).rejects.toThrow('Sinh viên đã có hợp đồng');
    expect(contractQuery.getCount).toHaveBeenCalledTimes(1);
    expect(contractRepository.save).not.toHaveBeenCalled();
  });
});
