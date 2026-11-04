import { useEffect, useState } from 'react';
import { billApi } from '../../api/bill.api';
import { contractApi } from '../../api/contract.api';
import { residenceApi } from '../../api/residence.api';
import { roomApi } from '../../api/room.api';
import Alert from 'react-bootstrap/Alert';
import ProgressBar from 'react-bootstrap/ProgressBar';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { buildTodos, countResidents, occupancyByBuilding, revenueLastMonths } from './dashboardStats';
import './DashboardPage.css';
import './Stats.css';

function countOccupied(rooms) {
  return rooms.filter((room) => Number(room.currentOccupancy) > 0).length;
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentBills, setRecentBills] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      roomApi.list(),
      residenceApi.list(),
      contractApi.list(),
      billApi.list(),
    ]).then((results) => {
      if (!active) return;
      const [roomsResult, requestsResult, contractsResult, billsResult] = results;
      const available = results.filter((result) => result.status === 'fulfilled');
      if (!available.length) {
        setLoadError('Không thể tải số liệu tổng quan. Vui lòng đăng nhập hoặc kiểm tra kết nối máy chủ.');
        return;
      }

      const rooms = roomsResult.status === 'fulfilled' ? roomsResult.value : null;
      const requests = requestsResult.status === 'fulfilled' ? requestsResult.value : null;
      const contracts = contractsResult.status === 'fulfilled' ? contractsResult.value : null;
      const bills = billsResult.status === 'fulfilled' ? billsResult.value : null;
      setStats({
        roomCount: rooms?.length ?? null,
        occupied: rooms ? countOccupied(rooms) : null,
        residentCount: contracts ? countResidents(contracts) : null,
        activeContracts: contracts?.filter((contract) => contract.is_active).length ?? null,
        unpaidBills: bills?.filter((bill) => !bill.is_paid).length ?? null,
        occupancy: rooms ? (rooms.length ? Math.round((countOccupied(rooms) / rooms.length) * 100) : 0) : null,
        buildings: rooms ? occupancyByBuilding(rooms) : [],
        revenue: bills ? revenueLastMonths(bills) : [],
        todos: buildTodos({ requests, contracts, bills }),
      });
      setRecentBills(bills?.slice().sort((a, b) => (
        Number(b.year) - Number(a.year) || Number(b.month) - Number(a.month)
      )).slice(0, 5) || []);
      if (available.length !== results.length) {
        setLoadError('Một vài số liệu bị ẩn do tài khoản chưa có quyền truy cập các API tương ứng.');
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageHeading
        eyebrow="TỔNG QUAN HOẠT ĐỘNG"
        title="Bảng điều khiển"
        description="Theo dõi nhanh tình hình vận hành ký túc xá."
        action={<span className="date-chip">{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date())}</span>}
      />
      {loadError && <Alert variant="warning" className="inline-notice" role="status">{loadError}</Alert>}
      <div className="stat-grid">
        <article className="stat-card"><span className="stat-icon teal">▦</span><span className="stat-label">Tổng số phòng</span><strong>{stats?.roomCount ?? '—'}</strong><span className="stat-foot">Trong toàn bộ các tòa</span></article>
        <article className="stat-card"><span className="stat-icon blue">♙</span><span className="stat-label">Sinh viên lưu trú</span><strong>{stats?.residentCount ?? '—'}</strong><span className="stat-foot">Có hợp đồng và phòng</span></article>
        <article className="stat-card"><span className="stat-icon green">▤</span><span className="stat-label">Hợp đồng hiệu lực</span><strong>{stats?.activeContracts ?? '—'}</strong><span className="stat-foot">Đang có hiệu lực</span></article>
        <article className="stat-card"><span className="stat-icon amber">▧</span><span className="stat-label">Hóa đơn chưa thu</span><strong>{stats?.unpaidBills ?? '—'}</strong><span className="stat-foot">Cần theo dõi thanh toán</span></article>
      </div>
      <div className="dashboard-grid">
        <section className="panel occupancy-panel">
          <div className="panel-heading"><div><h3>Công suất phòng</h3><p>Tỷ lệ phòng đang có người ở</p></div><span className="occupancy-value">{stats ? `${stats.occupancy}%` : '—'}</span></div>
          <ProgressBar className="progress-track" now={stats?.occupancy || 0} aria-label="Công suất phòng" />
          <div className="progress-labels"><span>{stats?.occupied ?? '—'} phòng đang có người</span><span>{stats?.roomCount ?? '—'} phòng tổng</span></div>
          <h4 className="dashboard-subtitle">Lấp đầy theo tòa</h4>
          {stats?.buildings?.length ? (
            <ul className="bar-list">
              {stats.buildings.map((item) => (
                <li key={item.building}>
                  <span>{item.building}</span>
                  <ProgressBar className="bar-track" now={item.percent} aria-label={`${item.building}: ${item.percent}%`} />
                  <strong>{item.occupied}/{item.capacity}</strong>
                </li>
              ))}
            </ul>
          ) : <p className="empty-inline">Chưa có dữ liệu phòng.</p>}
        </section>
        <section className="panel recent-panel">
          <div className="panel-heading"><div><h3>Hóa đơn gần đây</h3><p>Trạng thái hóa đơn điện nước</p></div><a href="#invoices" className="text-link">Xem tất cả</a></div>
          {recentBills.length ? (
            <div className="recent-list">
              {recentBills.map((bill) => (
                <div className="recent-item" key={bill.bill_id}>
                  <span className="recent-symbol">▧</span>
                  <span className="recent-copy"><strong>Hóa đơn #{bill.bill_id}</strong><small>Tháng {bill.month}/{bill.year}</small></span>
                  <span className="recent-total">{Number(bill.total_amount).toLocaleString('vi-VN')} ₫</span>
                  <StatusBadge value={bill.is_paid ? 'paid' : 'unpaid'} label={bill.is_paid ? 'Đã thu' : 'Chưa thu'} />
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-inline">{loadError || 'Chưa có hóa đơn để hiển thị.'}</p>
          )}
        </section>
        <section className="panel revenue-panel">
          <div className="panel-heading"><div><h3>Tiền đã thu 6 tháng</h3><p>Theo kỳ hóa đơn</p></div></div>
          {stats?.revenue?.some((item) => item.amount > 0) ? (
            <ul className="revenue-chart">
              {stats.revenue.map((item) => (
                <li key={item.label} title={`${item.amount.toLocaleString('vi-VN')} ₫`}>
                  <small>{item.amount ? `${(item.amount / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr` : '0'}</small>
                  <span className="revenue-column"><span style={{ height: `${item.percent}%` }} /></span>
                  <small>{item.label.slice(0, 2)}</small>
                </li>
              ))}
            </ul>
          ) : <p className="empty-inline">Chưa có khoản đã thu trong 6 tháng qua.</p>}
        </section>
        <section className="panel todo-panel">
          <div className="panel-heading"><div><h3>Việc cần làm</h3><p>Những mục đang chờ xử lý</p></div></div>
          {stats?.todos?.length ? (
            <ul className="todo-list">
              {stats.todos.map((todo) => (
                <li key={todo.key}><a href={todo.href}><strong>{todo.count}</strong> {todo.label}<span aria-hidden="true">→</span></a></li>
              ))}
            </ul>
          ) : <p className="empty-inline">Không có việc đang chờ.</p>}
        </section>
      </div>
    </>
  );
}
