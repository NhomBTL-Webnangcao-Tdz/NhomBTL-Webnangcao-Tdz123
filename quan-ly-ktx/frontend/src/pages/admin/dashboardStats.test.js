import { buildTodos, countResidents, occupancyByBuilding, revenueLastMonths } from './dashboardStats';

const today = new Date(2026, 10, 15);

test('chỉ đếm sinh viên có hợp đồng còn hiệu lực và có phòng', () => {
  const contracts = [
    { is_active: true, end_date: '2027-01-01', room: { id: 'a' }, student: { sid: 'A' } },
    { is_active: true, end_date: '2027-01-01', room: { id: 'b' }, student: { sid: 'A' } },
    { is_active: true, end_date: '2027-01-01', room: null, student: { sid: 'B' } },
    { is_active: false, end_date: '2027-01-01', room: { id: 'a' }, student: { sid: 'C' } },
    { is_active: true, end_date: '2026-11-14', room: { id: 'a' }, student: { sid: 'D' } },
    { is_active: true, end_date: '2026-11-15', room: { id: 'a' }, student: { sid: 'E' } },
  ];
  expect(countResidents(contracts, today)).toBe(2);
});

test('tính lấp đầy theo số chỗ của từng tòa', () => {
  const rooms = [
    { building: 'Tòa B', currentOccupancy: 1, maxCapacity: 4 },
    { building: 'Tòa A', currentOccupancy: 2, maxCapacity: 4 },
    { building: 'Tòa A', currentOccupancy: 2, maxCapacity: 4 },
  ];
  expect(occupancyByBuilding(rooms)).toEqual([
    { building: 'Tòa A', occupied: 4, capacity: 8, percent: 50 },
    { building: 'Tòa B', occupied: 1, capacity: 4, percent: 25 },
  ]);
  expect(occupancyByBuilding([])).toEqual([]);
});

test('không chia cho 0 khi tòa chưa có sức chứa', () => {
  expect(occupancyByBuilding([{ building: 'X', currentOccupancy: 0, maxCapacity: 0 }])[0].percent).toBe(0);
});

test('tiền thu 6 tháng gồm cả phần sinh viên đã đóng của hóa đơn chưa đủ', () => {
  const bills = [
    { month: 11, year: 2026, is_paid: true, total_amount: 100, shares: [] },
    { month: 11, year: 2026, is_paid: false, total_amount: 300, shares: [{ isPaid: true, amount: 100 }, { isPaid: false, amount: 200 }] },
    { month: 1, year: 2026, is_paid: true, total_amount: 999, shares: [] },
  ];
  const revenue = revenueLastMonths(bills, today);
  expect(revenue).toHaveLength(6);
  expect(revenue[0].label).toBe('06/2026');
  expect(revenue[5]).toMatchObject({ label: '11/2026', amount: 200, percent: 100 });
  expect(revenue.reduce((sum, item) => sum + item.amount, 0)).toBe(200);
});

test('khoảng 6 tháng đi qua năm cũ', () => {
  expect(revenueLastMonths([], new Date(2026, 1, 1))[0].label).toBe('09/2025');
});

test('danh sách việc cần làm bỏ mục bằng 0 và mục không có quyền đọc', () => {
  const todos = buildTodos({
    requests: [{ status: 'PENDING' }, { status: 'APPROVED' }],
    contracts: [
      { is_active: true, end_date: '2026-12-01' },
      { is_active: true, end_date: '2027-12-01' },
      { is_active: true, end_date: '2026-11-01' },
    ],
    bills: [{ is_paid: false, dueDate: '2026-11-01' }, { is_paid: true, dueDate: '2026-11-01' }, { is_paid: false, dueDate: '2026-12-01' }],
  }, today);
  expect(todos.map((todo) => [todo.key, todo.count])).toEqual([['requests', 1], ['contracts', 1], ['bills', 1]]);
  expect(buildTodos({ requests: undefined, contracts: [], bills: [] }, today)).toEqual([]);
});
