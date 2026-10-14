import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../common/AsyncState';

export default function RoleBasedRoute({ roles, children }) {
  const { user, isReady } = useAuth();

  if (!isReady) return <LoadingState message="Đang xác thực phiên đăng nhập..." />;
  if (!user) {
    return (
      <section className="access-card">
        <span className="access-icon">♙</span>
        <h2>Vui lòng đăng nhập</h2>
        <p>Bạn cần đăng nhập để truy cập các chức năng quản lý.</p>
        <a className="button button-primary" href="#login">Đăng nhập để tiếp tục</a>
      </section>
    );
  }
  if (roles && !roles.includes(user.role)) {
    return (
      <section className="access-card">
        <span className="access-icon">!</span>
        <h2>Không đủ quyền truy cập</h2>
        <p>Tài khoản {user.role} không được phép sử dụng chức năng này.</p>
      </section>
    );
  }
  return children;
}
