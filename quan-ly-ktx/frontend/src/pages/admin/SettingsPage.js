import { getApiBaseUrl } from '../../api/client';
import PageHeading from '../../components/common/PageHeading';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  return (
    <>
      <PageHeading eyebrow="THIẾT LẬP HỆ THỐNG" title="Cài đặt hệ thống" description="Thông tin tài khoản và kết nối hiện tại." />
      <section className="panel settings-panel">
        <div className="settings-row"><span>Tài khoản</span><strong>{user?.username || '—'}</strong></div>
        <div className="settings-row"><span>Vai trò</span><strong>{user?.role || '—'}</strong></div>
        <div className="settings-row"><span>Máy chủ API</span><strong>{getApiBaseUrl()}</strong></div>
        <p className="settings-note">Để đổi địa chỉ backend, cấu hình biến môi trường <code>REACT_APP_API_URL</code> trước khi chạy frontend.</p>
      </section>
    </>
  );
}
