import { useAuth } from '../../context/AuthContext';

const managementLinks = [
  { id: 'overview', label: 'Tổng quan', icon: '◫' },
  { id: 'rooms', label: 'Tòa nhà & Phòng', icon: '▦' },
  { id: 'students', label: 'Sinh viên', icon: '♙' },
  { id: 'contracts', label: 'Hợp đồng', icon: '▤' },
  { id: 'invoices', label: 'Hóa đơn', icon: '▧' },
  { id: 'utilities', label: 'Chỉ số điện nước', icon: 'ϟ' },
  { id: 'settings', label: 'Cài đặt', icon: '⚙' },
];

export default function Sidebar({ currentPage }) {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <a className="sidebar-brand" href="#overview">
        <span className="brand-mark">K</span>
        <span className="brand-name">KTX Care<small>QUẢN LÝ LƯU TRÚ</small></span>
      </a>
      <p className="sidebar-label">MENU CHÍNH</p>
      <nav className="sidebar-nav" aria-label="Điều hướng chính">
        {managementLinks.map(({ id, label, icon }) => (
          <a
            className={`sidebar-link${currentPage === id ? ' active' : ''}`}
            href={`#${id}`}
            key={id}
            aria-current={currentPage === id ? 'page' : undefined}
          >
            <span className="sidebar-icon" aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </a>
        ))}
      </nav>
      {user?.role === 'STUDENT' && (
        <>
          <p className="sidebar-label student-label">CỔNG SINH VIÊN</p>
          <nav className="sidebar-nav" aria-label="Cổng sinh viên">
            <a className="sidebar-link" href="#my-profile"><span className="sidebar-icon">♙</span>Hồ sơ cá nhân</a>
            <a className="sidebar-link" href="#my-room"><span className="sidebar-icon">▦</span>Phòng của tôi</a>
            <a className="sidebar-link" href="#my-bills"><span className="sidebar-icon">▧</span>Hóa đơn của tôi</a>
          </nav>
        </>
      )}
      <div className="sidebar-help">
        <span className="help-icon">?</span>
        <strong>Cần hỗ trợ?</strong>
        <span>Liên hệ ban quản lý ký túc xá.</span>
      </div>
      <div className="sidebar-system"><span className="status-dot" />Hệ thống đang hoạt động</div>
    </aside>
  );
}
