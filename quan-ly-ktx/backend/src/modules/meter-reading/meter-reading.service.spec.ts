import { DataSource } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Contract } from '../contract/contract.entity';
import { Notification } from '../notification/notification.entity';
import { Room } from '../room/room.entity';
import { UtilityBill } from '../utility-bill/utility-bill.entity';
import { UtilityBillShare } from '../utility-bill/utility-bill-share.entity';
import { UtilityTariff } from '../utility-bill/utility-tariff.entity';
import { MeterReadingStatus, MeterReadingSubmission } from './meter-reading.entity';
import { MeterReadingService } from './meter-reading.service';

function makeQueryBuilder() {
  const builder: Record<string, jest.Mock> = {};
  const chain = () => builder;
  ['where', 'andWhere', 'orderBy', 'addOrderBy', 'innerJoinAndSelect']
    .forEach((method) => { builder[method] = jest.fn(chain); });
  builder.getOne = jest.fn();
  builder.getMany = jest.fn();
  return builder;
}

function setupReview(existingUtilityBill: UtilityBill | null) {
  const room = {
    id: 'room-1',
    roomNumber: '101',
    building: 'A',
    price: 1200000,
  } as Room;
  const submission = {
    id: 4,
    room,
    month: 10,
    year: 2026,
    electricReading: 110,
    waterReading: 22,
    status: MeterReadingStatus.PENDING,
    reviewNote: null,
  } as MeterReadingSubmission;

  const submissionRepository = {
    findOne: jest.fn().mockResolvedValue(submission),
    save: jest.fn().mockImplementation(async (value) => value),
  };
  const contractsQuery = makeQueryBuilder();
  contractsQuery.getMany.mockResolvedValue([{ student: { sid: 'SV001' } }]);
  const contractRepository = { createQueryBuilder: jest.fn().mockReturnValue(contractsQuery) };

  const previousUtilityQuery = makeQueryBuilder();
  previousUtilityQuery.getOne.mockResolvedValue(null);
  const duplicateUtilityQuery = makeQueryBuilder();
  duplicateUtilityQuery.getOne.mockResolvedValue(existingUtilityBill);
  const billRepository = {
    createQueryBuilder: jest.fn()
      .mockReturnValueOnce(previousUtilityQuery)
      .mockReturnValueOnce(duplicateUtilityQuery),
    create: jest.fn((value) => value),
    save: jest.fn().mockImplementation(async (value) => ({ ...value, bill_id: 14 })),
  };
  const tariffRepository = {
    findOneBy: jest.fn().mockResolvedValue({ electricPrice: 3500, waterPrice: 20000 }),
  };
  const shareRepository = {
    create: jest.fn((value) => value),
    save: jest.fn().mockImplementation(async (value) => value),
  };
  const userRepository = { find: jest.fn().mockResolvedValue([]) };
  const notificationRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(),
  };
  const manager = {
    getRepository: jest.fn((entity) => {
      if (entity === MeterReadingSubmission) return submissionRepository;
      if (entity === Contract) return contractRepository;
      if (entity === UtilityBill) return billRepository;
      if (entity === UtilityTariff) return tariffRepository;
      if (entity === UtilityBillShare) return shareRepository;
      if (entity === User) return userRepository;
      if (entity === Notification) return notificationRepository;
      throw new Error(`Unexpected repository: ${String(entity)}`);
    }),
  };
  const queryRunner = {
    manager,
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };
  const dataSource = {
    getRepository: jest.fn().mockReturnValue(submissionRepository),
    createQueryRunner: jest.fn().mockReturnValue(queryRunner),
  } as unknown as DataSource;
  const service = new MeterReadingService(dataSource);

  return {
    service,
    submission,
    previousUtilityQuery,
    duplicateUtilityQuery,
    billRepository,
    shareRepository,
    queryRunner,
  };
}

describe('MeterReadingService utility bill uniqueness', () => {
  it('creates the monthly utility bill when a general charge already exists for that period', async () => {
    const { service, previousUtilityQuery, duplicateUtilityQuery, billRepository, shareRepository } = setupReview(null);

    await expect(service.review(4, 9, {
      status: 'APPROVED',
      electricReading: 110,
      waterReading: 22,
    })).resolves.toMatchObject({ status: MeterReadingStatus.APPROVED });

    expect(previousUtilityQuery.andWhere).toHaveBeenCalledWith(
      '(bill.bill_type IS NULL OR bill.bill_type = :billType)',
      { billType: 'UTILITY' },
    );
    expect(duplicateUtilityQuery.andWhere).toHaveBeenCalledWith(
      '(bill.bill_type IS NULL OR bill.bill_type = :billType)',
      { billType: 'UTILITY' },
    );
    expect(billRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      total_amount: 1200000,
      roomRentAmount: 1200000,
    }));
    expect(shareRepository.save).toHaveBeenCalled();
  });

  it('still blocks a second utility bill for the same room and period', async () => {
    const existingUtilityBill = { bill_id: 8 } as UtilityBill;
    const { service, billRepository, queryRunner } = setupReview(existingUtilityBill);

    await expect(service.review(4, 9, {
      status: 'APPROVED',
      electricReading: 110,
      waterReading: 22,
    })).rejects.toThrow('Phòng này đã có hóa đơn cho kỳ đó.');

    expect(billRepository.save).not.toHaveBeenCalled();
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });
});
