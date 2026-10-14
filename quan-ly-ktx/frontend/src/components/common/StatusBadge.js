const statusClasses = {
  active: 'status-green',
  current: 'status-green',
  available: 'status-green',
  paid: 'status-green',
  partial: 'status-yellow',
  upcoming: 'status-yellow',
  occupied: 'status-yellow',
  overdue: 'status-red',
  full: 'status-red',
  inactive: 'status-gray',
  maintenance: 'status-gray',
  unpaid: 'status-red',
};

export default function StatusBadge({ value, label }) {
  const normalized = String(value || '').toLowerCase();
  let className = 'status-gray';
  if (normalized.includes('đang') || normalized.includes('hiệu lực') || normalized === 'true') className = statusClasses.active;
  else if (normalized.includes('sắp') || normalized.includes('một phần')) className = statusClasses.upcoming;
  else if (normalized.includes('quá hạn') || normalized.includes('chưa thanh toán') || normalized.includes('đầy')) className = statusClasses.overdue;
  else if (normalized.includes('trống') || normalized.includes('đã thanh toán')) className = statusClasses.available;
  else if (normalized.includes('bảo trì') || normalized.includes('hết hiệu lực')) className = statusClasses.maintenance;
  else if (statusClasses[normalized]) className = statusClasses[normalized];

  return <span className={`status-badge ${className}`}>{label || value || 'Chưa cập nhật'}</span>;
}
