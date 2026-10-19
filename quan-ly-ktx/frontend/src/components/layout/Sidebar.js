import { useAuth } from '../../context/AuthContext';

const managementLinks = [
  { id: 'overview', label: 'Tổng quan', icon: '◫' },
  { id: 'rooms', label: 'Tòa nhà & Phòng', icon: '▦' },
  { id: 'requests', label: 'Yêu cầu lưu trú', icon: '✉' },
  { id: 'contracts', label: 'Hợp đồng', icon: '▤' },
  { id: 'invoices', label: 'Hóa đơn', icon: '▧' },
  { id: 'utilities', label: 'Chỉ số điện nước', icon: 'ϟ' },
  { id: 'settings', label: 'Cài đặt', icon: '⚙' },
];

const managerLinks = managementLinks.filter(({ id }) => id !== 'settings');

const studentLinks = [
  { id: 'my-profile', label: 'Hồ sơ cá nhân', icon: '♙' },
  { id: 'my-room', label: 'Phòng của tôi', icon: '▦' },
  { id: 'my-bills', label: 'Hóa đơn của tôi', icon: '▧' },
  { id: 'my-contact', label: 'Liên hệ quản lý', icon: '✉' },
];

export default function Sidebar({ currentPage }) {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const links = isStudent ? studentLinks : user?.role === 'MANAGER' ? managerLinks : managementLinks;
  const homePage = isStudent ? 'my-profile' : 'overview';

  return (
    <aside className="sidebar">
      <a className="sidebar-brand" href={`#${homePage}`}>
        <span className="brand-mark">K</span>
        <span className="brand-name">KTX Care<small>QUẢN LÝ LƯU TRÚ</small></span>
      </a>
      <p className="sidebar-label">{isStudent ? 'CỔNG SINH VIÊN' : 'MENU CHÍNH'}</p>
      <nav className="sidebar-nav" aria-label="Điều hướng chính">
        {links.map(({ id, label, icon }) => (
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
      <div className="sidebar-help">
        <span className="help-icon">?</span>
        <strong>Cần hỗ trợ?</strong>
        {isStudent
          ? <a href="#my-contact">Liên hệ ban quản lý ký túc xá.</a>
          : <span>Liên hệ ban quản lý ký túc xá.</span>}
      </div>
      <div className="sidebar-system"><span className="status-dot" />Hệ thống đang hoạt động</div>
    </aside>
  );
}
