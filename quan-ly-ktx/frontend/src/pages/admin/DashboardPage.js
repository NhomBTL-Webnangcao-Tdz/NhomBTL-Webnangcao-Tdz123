import { useEffect, useState } from 'react';
import { billApi } from '../../api/bill.api';
import { contractApi } from '../../api/contract.api';
import { roomApi } from '../../api/room.api';
import { studentApi } from '../../api/student.api';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
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
      studentApi.list(),
      contractApi.list(),
      billApi.list(),
    ]).then((results) => {
      if (!active) return;
      const [roomsResult, studentsResult, contractsResult, billsResult] = results;
      const available = results.filter((result) => result.status === 'fulfilled');
      if (!available.length) {
        setLoadError('Không thể tải số liệu tổng quan. Vui lòng đăng nhập hoặc kiểm tra kết nối máy chủ.');
        return;
      }

      const rooms = roomsResult.status === 'fulfilled' ? roomsResult.value : null;
      const students = studentsResult.status === 'fulfilled' ? studentsResult.value : null;
      const contracts = contractsResult.status === 'fulfilled' ? contractsResult.value : null;
      const bills = billsResult.status === 'fulfilled' ? billsResult.value : null;
      setStats({
        roomCount: rooms?.length ?? null,
        occupied: rooms ? countOccupied(rooms) : null,
        studentCount: students?.length ?? null,
        activeContracts: contracts?.filter((contract) => contract.is_active).length ?? null,
        unpaidBills: bills?.filter((bill) => !bill.is_paid).length ?? null,
        occupancy: rooms ? (rooms.length ? Math.round((countOccupied(rooms) / rooms.length) * 100) : 0) : null,
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
      {loadError && <div className="inline-notice" role="status">{loadError}</div>}
      <div className="stat-grid">
        <article className="stat-card"><span className="stat-icon teal">▦</span><span className="stat-label">Tổng số phòng</span><strong>{stats?.roomCount ?? '—'}</strong><span className="stat-foot">Trong toàn bộ các tòa</span></article>
        <article className="stat-card"><span className="stat-icon blue">♙</span><span className="stat-label">Sinh viên lưu trú</span><strong>{stats?.studentCount ?? '—'}</strong><span className="stat-foot">Hồ sơ đã đăng ký</span></article>
        <article className="stat-card"><span className="stat-icon green">▤</span><span className="stat-label">Hợp đồng hiệu lực</span><strong>{stats?.activeContracts ?? '—'}</strong><span className="stat-foot">Đang có hiệu lực</span></article>
        <article className="stat-card"><span className="stat-icon amber">▧</span><span className="stat-label">Hóa đơn chưa thu</span><strong>{stats?.unpaidBills ?? '—'}</strong><span className="stat-foot">Cần theo dõi thanh toán</span></article>
      </div>
      <div className="dashboard-grid">
        <section className="panel occupancy-panel">
          <div className="panel-heading"><div><h3>Công suất phòng</h3><p>Tỷ lệ phòng đang có người ở</p></div><span className="occupancy-value">{stats ? `${stats.occupancy}%` : '—'}</span></div>
          <div className="progress-track"><span style={{ width: `${stats?.occupancy || 0}%` }} /></div>
          <div className="progress-labels"><span>{stats?.occupied ?? '—'} phòng đang có người</span><span>{stats?.roomCount ?? '—'} phòng tổng</span></div>
          <div className="dashboard-shortcuts">
            <a href="#rooms">Quản lý phòng <span>→</span></a>
            <a href="#students">Danh sách sinh viên <span>→</span></a>
            <a href="#contracts">Theo dõi hợp đồng <span>→</span></a>
          </div>
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
      </div>
    </>
  );
}
