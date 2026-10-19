import { useEffect, useState } from 'react';
import './App.css';
import { LoadingState } from './components/common/AsyncState';
import AppLayout from './components/layout/AppLayout';
import RoleBasedRoute from './components/guards/RoleBasedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import BillsPage from './pages/admin/BillsPage';
import ContractsPage from './pages/admin/ContractsPage';
import DashboardPage from './pages/admin/DashboardPage';
import RoomsPage from './pages/admin/RoomsPage';
import SettingsPage from './pages/admin/SettingsPage';
import StudentsPage from './pages/admin/StudentsPage';
import UtilitiesPage from './pages/admin/UtilitiesPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/public/LandingPage';
import StudentPortalPage from './pages/student/StudentPortalPage';
import { getHashRoute } from './utils/hashRoute';

const ADMIN_ROLES = ['ADMIN', 'MANAGER'];
const aliases = {
  dashboard: 'overview',
  'utility-bills': 'invoices',
};

function RoutedContent() {
  const [route, setRoute] = useState(getHashRoute);
  const { user, isReady } = useAuth();

  useEffect(() => {
    const handleRouteChange = () => setRoute(getHashRoute());
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  const currentPage = aliases[route.page] || route.page;
  const isAuthPage = currentPage === 'login' || currentPage === 'register';

  useEffect(() => {
    if (isReady && user && isAuthPage) {
      window.location.hash = user.role === 'STUDENT' ? '#my-profile' : '#overview';
    }
  }, [isReady, user, isAuthPage]);

  if (!isReady) {
    return (
      <div className="auth-screen">
        <LoadingState message="Kết nối phiên đăng nhập..." />
      </div>
    );
  }

  // Trang chủ công khai: ai cũng xem được, nằm ngoài khung quản trị.
  if (currentPage === 'home') {
    return <LandingPage />;
  }

  if (!user || isAuthPage) {
    if (user) {
      return (
        <div className="auth-screen">
          <LoadingState message="Đang mở không gian làm việc..." />
        </div>
      );
    }
    return (
      <div className="auth-screen">
        <a className="auth-brand" href="#home" aria-label="Về trang chủ KTX Care">
          <span className="brand-mark">K</span>
          <span>KTX Care<small>QUẢN LÝ KÝ TÚC XÁ</small></span>
        </a>
        <main className="auth-main">
          {currentPage === 'register' ? <RegisterPage /> : <LoginPage />}
        </main>
        <footer className="auth-footer">KTX Care · Hệ thống quản lý ký túc xá</footer>
      </div>
    );
  }

  const adminPage = (() => {
    switch (currentPage) {
      case 'overview': return <DashboardPage />;
      case 'rooms': return <RoomsPage segments={route.segments} params={route.params} />;
      case 'students': return <StudentsPage params={route.params} />;
      case 'contracts': return <ContractsPage />;
      case 'invoices': return <BillsPage />;
      case 'utilities': return <UtilitiesPage />;
      case 'settings': return <SettingsPage />;
      default: return null;
    }
  })();

  let content;
  if (adminPage) {
    content = <RoleBasedRoute roles={ADMIN_ROLES}>{adminPage}</RoleBasedRoute>;
  } else if (['my-profile', 'my-room', 'my-bills'].includes(currentPage)) {
    content = <RoleBasedRoute roles={['STUDENT']}><StudentPortalPage page={currentPage} /></RoleBasedRoute>;
  } else {
    content = (
      <section className="access-card">
        <span className="access-icon">404</span>
        <h2>Không tìm thấy trang</h2>
        <p>Đường dẫn này không tồn tại trong hệ thống quản lý.</p>
        <a className="button button-primary" href="#overview">Về tổng quan</a>
      </section>
    );
  }

  return <AppLayout currentPage={currentPage}>{content}</AppLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <RoutedContent />
    </AuthProvider>
  );
}
