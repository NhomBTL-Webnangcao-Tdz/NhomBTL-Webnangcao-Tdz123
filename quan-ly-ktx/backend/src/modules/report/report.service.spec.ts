import { DataSource } from 'typeorm';
import { ReportService } from './report.service';

function makeQueryBuilder(result: {
  count?: number;
  rawOne?: { total: string };
  rawMany?: unknown[];
}) {
  return {
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(result.count ?? 0),
    getRawOne: jest.fn().mockResolvedValue(result.rawOne ?? { total: '0' }),
    getRawMany: jest.fn().mockResolvedValue(result.rawMany ?? []),
  };
}

describe('ReportService.getSummary', () => {
  it('filters monthly totals and debts and returns building occupancy and expiring contracts', async () => {
    const activeContractsQuery = makeQueryBuilder({ count: 3 });
    const occupiedRoomsQuery = makeQueryBuilder({ rawOne: { total: '2' } });
    const expiringContractsQuery = makeQueryBuilder({
      rawMany: [{
        contractId: '4',
        endDate: '2026-11-20',
        studentSid: 'S004',
        studentName: 'Student Four',
        roomNumber: 'A101',
        building: 'A',
      }],
    });
    const buildingsQuery = makeQueryBuilder({
      rawMany: [{ building: 'A', roomCount: '4', occupiedStudents: '6', capacity: '10' }],
    });
    const paymentsQuery = makeQueryBuilder({ rawOne: { total: '125000' } });
    const sharesQuery = makeQueryBuilder({ rawOne: { total: '25000' } });
    const legacyBillsQuery = makeQueryBuilder({ rawOne: { total: '5000' } });
    const contractsQueries = [activeContractsQuery, occupiedRoomsQuery, expiringContractsQuery];
    const contractsRepository = {
      createQueryBuilder: jest.fn(() => contractsQueries.shift()),
    };
    const roomsRepository = {
      count: jest.fn().mockResolvedValue(8),
      createQueryBuilder: jest.fn().mockReturnValue(buildingsQuery),
    };
    const paymentsRepository = { createQueryBuilder: jest.fn().mockReturnValue(paymentsQuery) };
    const sharesRepository = { createQueryBuilder: jest.fn().mockReturnValue(sharesQuery) };
    const billsRepository = { createQueryBuilder: jest.fn().mockReturnValue(legacyBillsQuery) };
    const studentsRepository = { count: jest.fn().mockResolvedValue(20) };
    const repositories = new Map([
      ['student', studentsRepository],
      ['rooms', roomsRepository],
      ['contract', contractsRepository],
      ['payment', paymentsRepository],
      ['utility_bill', billsRepository],
      ['utility_bill_share', sharesRepository],
    ]);
    const dataSource = {
      getRepository: jest.fn((entity: { name: string }) => {
        const tableName = entity.name === 'UtilityBillShare' ? 'utility_bill_share'
          : entity.name === 'UtilityBill' ? 'utility_bill'
            : entity.name === 'Payment' ? 'payment'
              : entity.name === 'Contract' ? 'contract'
                : entity.name === 'Room' ? 'rooms' : 'student';
        return repositories.get(tableName);
      }),
    };
    const service = new ReportService(dataSource as unknown as DataSource);

    const result = await service.getSummary({ month: 8, year: 2026 });

    expect(result).toMatchObject({
      month: 8,
      year: 2026,
      students: 20,
      rooms: 8,
      activeContracts: 3,
      occupiedRooms: 2,
      occupancyByBuilding: [{
        building: 'A',
        roomCount: 4,
        occupiedStudents: 6,
        capacity: 10,
        occupancyRate: 60,
      }],
      expiringContracts: [{
        contractId: 4,
        studentSid: 'S004',
        studentName: 'Student Four',
        roomNumber: 'A101',
        building: 'A',
        endDate: '2026-11-20',
      }],
      outstandingDebt: 30000,
      paymentsInPeriod: 125000,
      paymentsThisMonth: 125000,
    });
    expect(paymentsQuery.where).toHaveBeenCalledWith(
      'payment.payment_date >= :monthStart',
      { monthStart: '2026-08-01 00:00:00' },
    );
    expect(paymentsQuery.andWhere).toHaveBeenCalledWith(
      'payment.payment_date < :nextMonthStart',
      { nextMonthStart: '2026-09-01 00:00:00' },
    );
    expect(sharesQuery.andWhere).toHaveBeenCalledWith('bill.month = :month', { month: 8 });
    expect(sharesQuery.andWhere).toHaveBeenCalledWith('bill.year = :year', { year: 2026 });
    expect(legacyBillsQuery.andWhere).toHaveBeenCalledWith('bill.month = :month', { month: 8 });
    expect(legacyBillsQuery.andWhere).toHaveBeenCalledWith('bill.year = :year', { year: 2026 });
  });
});
