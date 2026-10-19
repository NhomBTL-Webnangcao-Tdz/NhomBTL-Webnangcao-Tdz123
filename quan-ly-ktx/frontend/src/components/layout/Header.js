import { useEffect, useState } from 'react';
import { notificationApi } from '../../api/notification.api';
import { useAuth } from '../../context/AuthContext';

const pageNames = {
  overview: 'Tổng quan',
  rooms: 'Quản lý Tòa nhà & Phòng',
  requests: 'Yêu cầu lưu trú',
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
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState('');
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const userId = user?.id;
  const userRole = user?.role;
  const homePage = user?.role === 'STUDENT' ? 'my-profile' : 'overview';

  useEffect(() => {
    if (userId === undefined) return undefined;
    let active = true;
    const loadNotifications = () => notificationApi.list()
      .then((result) => {
        if (active) {
          setNotifications(result);
          setNotificationError('');
        }
      })
      .catch((error) => { if (active) setNotificationError(error.message); });
    loadNotifications();
    const refreshInterval = window.setInterval(loadNotifications, 30000);
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
    };
  }, [userId, userRole]);

  const markRead = async (notification) => {
    try {
      const updated = await notificationApi.markRead(notification.id);
      setNotifications((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotificationError('');
    } catch (error) {
      setNotificationError(error.message);
    }
  };

  return (
    <header className="top-header">
      <div className="breadcrumb">
        <a href={`#${homePage}`}>KTX Care</a>
        <span aria-hidden="true">/</span>
        <strong>{pageNames[currentPage] || 'Ký túc xá'}</strong>
      </div>
      <div className="header-actions">
        <div className="notification-wrap">
          <button
            className={`icon-button notification-button${showNotifications ? ' selected' : ''}`}
            aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}`}
            aria-expanded={showNotifications}
            onClick={async () => {
              const nextShown = !showNotifications;
              setShowNotifications(nextShown);
              if (nextShown && user) {
                try {
                  setNotifications(await notificationApi.list());
                  setNotificationError('');
                } catch (error) {
                  setNotificationError(error.message);
                }
              }
            }}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
            {unreadCount > 0 && <span className="notification-unread-dot" aria-hidden="true" />}
          </button>
          {showNotifications && (
            <div className="notification-popover" role="region" aria-label="Thông báo">
              <strong>Thông báo</strong>
              {notificationError && <p className="form-error" role="alert">{notificationError}</p>}
              {notifications.length ? <ul className="notification-list">{notifications.map((notification) => (
                  <li className={notification.isRead ? '' : 'unread'} key={notification.id}>
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <small>{new Date(notification.createdAt).toLocaleString('vi-VN')}</small>
                    {!notification.isRead && <button className="text-button" onClick={() => markRead(notification)}>Đánh dấu đã đọc</button>}
                  </li>
                ))}</ul> : <p>Chưa có thông báo mới.</p>}
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
