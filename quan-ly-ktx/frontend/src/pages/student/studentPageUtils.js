export function formatDate(value) {
  if (!value) return '—';
  return String(value).slice(0, 10).split('-').reverse().join('/');
}

export function getBillStatus(dueDate) {
  const due = new Date(`${String(dueDate).slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today ? 'Quá hạn' : 'Sắp đến hạn';
}
