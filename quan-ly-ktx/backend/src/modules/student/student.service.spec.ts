import { DataSource, Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Contract } from '../contract/contract.entity';
import { Notification } from '../notification/notification.entity';
import { UtilityBill } from '../utility-bill/utility-bill.entity';
import { ResidenceRequest } from './residence-request.entity';
import { Student } from './student.entity';
import { StudentService } from './student.service';

function makeQueryBuilder() {
  const builder: Record<string, jest.Mock> = {};
  const chain = () => builder;
  ['innerJoin', 'leftJoinAndSelect', 'where', 'andWhere', 'orderBy', 'select', 'addSelect']
    .forEach((method) => { builder[method] = jest.fn(chain); });
  builder.getOne = jest.fn();
  builder.getRawMany = jest.fn();
  builder.getMany = jest.fn();
  return builder;
}

describe('StudentService student portal', () => {
  it('saves a student profile and links it to the account in one transaction', async () => {
    const user = { id: 8, studentSid: null };
    const student = { sid: 'SV008', sname: 'Sinh viên tám', email: 'sv8@example.com', phone: '0900000008' };
    const userRepository = { findOne: jest.fn().mockResolvedValue(user), save: jest.fn() };
    const studentRepository = {
      findOneBy: jest.fn().mockResolvedValue(null),
      create: jest.fn((profile) => profile),
      save: jest.fn(),
    };
    const manager = {
      getRepository: jest.fn((entity) => entity === User ? userRepository : studentRepository),
    };
    const dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    } as unknown as DataSource;
    const service = new StudentService({} as Repository<Student>, dataSource);
    jest.spyOn(service, 'getPortalData').mockResolvedValue({ linked: true } as Awaited<ReturnType<StudentService['getPortalData']>>);

    await service.saveMyProfile(8, student);

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(studentRepository.save).toHaveBeenCalledWith(expect.objectContaining(student));
    expect(user.studentSid).toBe('SV008');
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });

  it('creates a pending residence request and notifies managers transactionally', async () => {
    const user = { id: 8, studentSid: 'SV008' };
    const userRepository = {
      findOne: jest.fn().mockResolvedValue(user),
      find: jest.fn().mockResolvedValue([{ id: 3 }]),
    };
    const savedRequest = { id: 12, status: 'PENDING', requestedAt: new Date() };
    const residenceRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn().mockResolvedValue(savedRequest),
    };
    const contractQuery = makeQueryBuilder();
    contractQuery.getOne.mockResolvedValue(null);
    const contractRepository = { createQueryBuilder: jest.fn().mockReturnValue(contractQuery) };
    const notificationRepository = {
      create: jest.fn((value) => value),
      save: jest.fn().mockResolvedValue([]),
    };
    const manager = {
      getRepository: jest.fn((entity) => {
        if (entity === User) return userRepository;
        if (entity === ResidenceRequest) return residenceRepository;
        if (entity === Contract) return contractRepository;
        if (entity === Notification) return notificationRepository;
        throw new Error(`Unexpected repository: ${String(entity)}`);
      }),
    };
    const dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    } as unknown as DataSource;
    const service = new StudentService({} as Repository<Student>, dataSource);

    await expect(service.requestResidence(8, { note: 'Gần khu học tập' })).resolves.toEqual({
      id: 12,
      status: 'PENDING',
      requestedAt: savedRequest.requestedAt,
    });

    expect(residenceRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      student: { sid: 'SV008' },
      status: 'PENDING',
      note: 'Gần khu học tập',
    }));
    expect(notificationRepository.save).toHaveBeenCalledWith([
      expect.objectContaining({ userId: 3, title: 'Yêu cầu lưu trú mới' }),
    ]);
  });

  it('waits for the reviewed request query before releasing its query runner', async () => {
    let released = false;
    const reviewedRequest = {
      id: 12,
      status: 'REJECTED',
      student: { sid: 'SV008' },
      reviewNote: 'Không đủ điều kiện.',
    };
    const requestRepository = {
      findOne: jest.fn()
        .mockResolvedValueOnce({
          id: 12,
          status: 'PENDING',
          student: { sid: 'SV008' },
          reviewNote: null,
        })
        .mockImplementationOnce(() => new Promise((resolve, reject) => {
          setTimeout(() => {
            if (released) {
              reject(new Error('Query runner released before the follow-up query completed.'));
            } else {
              resolve(reviewedRequest);
            }
          }, 0);
        })),
      save: jest.fn(),
    };
    const userRepository = { findOne: jest.fn().mockResolvedValue(null) };
    const manager = {
      getRepository: jest.fn((entity) => entity === ResidenceRequest ? requestRepository : userRepository),
    };
    const queryRunner = {
      manager,
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(async () => { released = true; }),
    };
    const dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as DataSource;
    const service = new StudentService({} as Repository<Student>, dataSource);

    await expect(service.reviewResidenceRequest(12, 3, 'reject', {
      reviewNote: 'Không đủ điều kiện.',
    })).resolves.toBe(reviewedRequest);

    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
    expect(released).toBe(true);
  });

  it('returns no private roster or billing data for an account without a linked student profile', async () => {
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 8, studentSid: null }),
    };
    const dataSource = {
      getRepository: jest.fn().mockReturnValue(userRepository),
    } as unknown as DataSource;
    const studentRepository = {} as Repository<Student>;
    const service = new StudentService(studentRepository, dataSource);

    await expect(service.getPortalData(8)).resolves.toEqual({
      linked: false,
      student: null,
      room: null,
      roommates: [],
      bills: [],
      residenceRequest: null,
    });
    expect(dataSource.getRepository).toHaveBeenCalledWith(User);
  });

  it('returns unpaid personal bills immediately, including bills due more than seven days later', async () => {
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 8, studentSid: 'SV008' }),
    };
    const currentContractQuery = makeQueryBuilder();
    currentContractQuery.getOne.mockResolvedValue({
      room: { id: 'room-1', roomNumber: '302', building: 'Tòa B' },
    });
    const roommatesQuery = makeQueryBuilder();
    roommatesQuery.getRawMany.mockResolvedValue([
      { sid: 'SV009', name: 'Sinh viên chín', phone: '0900000009' },
    ]);
    const contractRepository = {
      createQueryBuilder: jest.fn()
        .mockReturnValueOnce(currentContractQuery)
        .mockReturnValueOnce(roommatesQuery),
    } as unknown as Repository<Contract>;
    const billsQuery = makeQueryBuilder();
    billsQuery.getMany.mockResolvedValue([{
      bill_id: 5,
      month: 10,
      year: 2026,
      total_amount: '85000.00',
      dueDate: new Date('2026-11-20T00:00:00.000Z'),
      is_paid: false,
      shares: [{
        amount: '42500.00',
        roomRentAmount: '25000.00',
        isPaid: false,
        student: { sid: 'SV008' },
      }],
    }]);
    const billRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(billsQuery),
    } as unknown as Repository<UtilityBill>;
    const residenceRequestRepository = { findOne: jest.fn().mockResolvedValue(null) };
    const dataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === User) return userRepository;
        if (entity === Contract) return contractRepository;
        if (entity === ResidenceRequest) return residenceRequestRepository;
        return billRepository;
      }),
    } as unknown as DataSource;
    const student = { sid: 'SV008', sname: 'Sinh viên tám', email: 'sv8@example.com', phone: '0900000008' } as Student;
    const studentRepository = {
      findOneBy: jest.fn().mockResolvedValue(student),
    } as unknown as Repository<Student>;
    const service = new StudentService(studentRepository, dataSource);

    const result = await service.getPortalData(8);

    expect(result).toEqual({
      linked: true,
      student: { sid: 'SV008', name: 'Sinh viên tám', email: 'sv8@example.com', phone: '0900000008' },
      room: { id: 'room-1', roomNumber: '302', building: 'Tòa B' },
      roommates: [{ sid: 'SV009', name: 'Sinh viên chín', phone: '0900000009' }],
      bills: [{
        bill_id: 5,
        billType: 'UTILITY',
        title: undefined,
        description: undefined,
        hasReceiptImage: false,
        month: 10,
        year: 2026,
        roomRentAmount: 25000,
        total_amount: 42500,
        dueDate: new Date('2026-11-20T00:00:00.000Z'),
        is_paid: false,
      }],
      residenceRequest: null,
    });
    expect(billsQuery.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('DATE_ADD(CURRENT_DATE()'),
      expect.anything(),
    );
    expect(billsQuery.andWhere).toHaveBeenCalledWith(
      '(share.id IS NULL OR (share.student_sid = :studentSid AND share.is_paid = :shareIsPaid))',
      { studentSid: 'SV008', shareIsPaid: false },
    );
  });
});
