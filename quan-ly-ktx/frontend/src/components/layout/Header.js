import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const pageNames = {
  overview: 'Tổng quan',
  rooms: 'Quản lý Tòa nhà & Phòng',
  students: 'Quản lý Sinh viên',
  contracts: 'Quản lý Hợp đồng',
  invoices: 'Hóa đơn & Dịch vụ',
  utilities: 'Nhập chỉ số điện nước',
  settings: 'Cài đặt hệ thống',
  'my-profile': 'Hồ sơ cá nhân',
  'my-room': 'Phòng của tôi',
  'my-bills': 'Hóa đơn của tôi',
  login: 'Đăng nhập',
  register: 'Đăng ký tài khoản',
};

export default function Header({ currentPage }) {
  const { user, logout, sessionError } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="top-header">
      <div className="breadcrumb">
        <a href="#overview">KTX Care</a>
        <span aria-hidden="true">/</span>
        <strong>{pageNames[currentPage] || 'Ký túc xá'}</strong>
      </div>
      <div className="header-actions">
        <div className="notification-wrap">
          <button
            className={`icon-button notification-button${showNotifications ? ' selected' : ''}`}
            aria-label="Thông báo"
            aria-expanded={showNotifications}
            onClick={() => setShowNotifications((shown) => !shown)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
          </button>
          {showNotifications && (
            <div className="notification-popover" role="status">
              <strong>Thông báo</strong>
              <p>Các nhắc nhở hợp đồng và công nợ sẽ hiển thị tại đây khi có dữ liệu.</p>
            </div>
          )}
        </div>
        {user ? (
          <div className="account-menu">
            <span className="account-avatar">{(user.username || user.role || 'A').slice(0, 1).toUpperCase()}</span>
            <span className="account-copy"><strong>{user.username}</strong><small>{user.role}</small></span>
            <button className="button button-quiet" onClick={logout}>Đăng xuất</button>
          </div>
        ) : (
          <>
            {sessionError && <span className="session-warning" role="alert">{sessionError}</span>}
            <a className="button button-primary sign-in-button" href="#login">Đăng nhập</a>
          </>
        )}
      </div>
    </header>
  );
}
