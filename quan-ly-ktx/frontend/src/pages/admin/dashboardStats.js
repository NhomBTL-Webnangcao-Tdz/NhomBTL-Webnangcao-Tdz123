const DAY = 86400000;

function startOfDay(date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function dateOnly(value) {
  return new Date(`${String(value).slice(0, 10)}T00:00:00`);
}

export function isContractCurrent(contract, today = new Date()) {
  return Boolean(contract.is_active) && dateOnly(contract.end_date) >= startOfDay(today);
}

// Đếm người đang ở thật theo hợp đồng còn hiệu lực có gắn phòng, không đếm hồ sơ chưa ở.
export function countResidents(contracts, today = new Date()) {
  const sids = contracts
    .filter((contract) => contract.room && isContractCurrent(contract, today))
    .map((contract) => contract.student?.sid);
  return new Set(sids).size;
}

export function occupancyByBuilding(rooms) {
  const groups = new Map();
  rooms.forEach((room) => {
    const building = room.building || 'Chưa rõ tòa';
    const group = groups.get(building) || { building, occupied: 0, capacity: 0 };
    group.occupied += Number(room.currentOccupancy) || 0;
    group.capacity += Number(room.maxCapacity) || 0;
    groups.set(building, group);
  });
  return [...groups.values()]
    .sort((left, right) => left.building.localeCompare(right.building, 'vi'))
    .map((group) => ({
      ...group,
      percent: group.capacity ? Math.min(100, Math.round((group.occupied / group.capacity) * 100)) : 0,
    }));
}

function collectedAmount(bill) {
  if (bill.shares?.length) {
    return bill.shares.reduce((sum, share) => sum + (share.isPaid ? Number(share.amount) || 0 : 0), 0);
  }
  return bill.is_paid ? Number(bill.total_amount) || 0 : 0;
}

export function revenueLastMonths(bills, today = new Date(), months = 6) {
  const periods = Array.from({ length: months }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (months - 1 - index), 1);
    return { month: date.getMonth() + 1, year: date.getFullYear(), amount: 0 };
  });
  bills.forEach((bill) => {
    const period = periods.find((item) => item.month === Number(bill.month) && item.year === Number(bill.year));
    if (period) period.amount += collectedAmount(bill);
  });
  const highest = Math.max(...periods.map((period) => period.amount), 0);
  return periods.map((period) => ({
    ...period,
    label: `${String(period.month).padStart(2, '0')}/${period.year}`,
    percent: highest ? Math.round((period.amount / highest) * 100) : 0,
  }));
}

export function buildTodos({ requests, contracts, bills }, today = new Date()) {
  const now = startOfDay(today);
  const pendingRequests = requests?.filter((request) => request.status === 'PENDING').length;
  const expiringContracts = contracts?.filter((contract) => {
    if (!isContractCurrent(contract, today)) return false;
    return (dateOnly(contract.end_date) - now) / DAY <= 30;
  }).length;
  const overdueBills = bills?.filter((bill) => !bill.is_paid && bill.dueDate && dateOnly(bill.dueDate) < now).length;
  return [
    { key: 'requests', count: pendingRequests, label: 'yêu cầu lưu trú chờ duyệt', href: '#requests' },
    { key: 'contracts', count: expiringContracts, label: 'hợp đồng hết hạn trong 30 ngày', href: '#contracts' },
    { key: 'bills', count: overdueBills, label: 'hóa đơn quá hạn chưa thu', href: '#invoices' },
  ].filter((todo) => todo.count > 0);
}
