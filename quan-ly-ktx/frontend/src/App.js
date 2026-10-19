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
import ResidenceRequestsPage from './pages/admin/ResidenceRequestsPage';
import SettingsPage from './pages/admin/SettingsPage';
import UtilitiesPage from './pages/admin/UtilitiesPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/landing/LandingPage';
import StudentPortalPage from './pages/student/StudentPortalPage';
import { getHashRoute } from './utils/hashRoute';

const ADMIN_ROLES = ['ADMIN', 'MANAGER'];
const LANDING_PAGES = ['welcome', 'gioi-thieu', 'lien-he'];
const aliases = {
  home: 'overview',
  dashboard: 'overview',
  'utility-bills': 'invoices',
  'residence-requests': 'requests',
};
const STUDENT_PAGES = ['my-profile', 'my-room', 'my-bills', 'my-contact'];

function RoutedContent() {
  const [route, setRoute] = useState(getHashRoute);
  const [isLandingRoute, setIsLandingRoute] = useState(() => (
    !window.location.hash || LANDING_PAGES.includes(getHashRoute().page)
  ));
  const { user, isReady } = useAuth();

  useEffect(() => {
    const handleRouteChange = () => {
      const nextRoute = getHashRoute();
      setRoute(nextRoute);
      setIsLandingRoute(LANDING_PAGES.includes(nextRoute.page));
    };
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

  useEffect(() => {
    if (isReady && user?.role === 'STUDENT' && !STUDENT_PAGES.includes(currentPage)) {
      window.location.hash = '#my-profile';
    }
  }, [isReady, user, currentPage]);

  if (!isReady) {
    return (
      <div className="auth-screen">
        <LoadingState message="Kết nối phiên đăng nhập..." />
      </div>
    );
  }

  if (!user || isAuthPage) {
    if (user) {
      return (
        <div className="auth-screen">
          <LoadingState message="Đang mở không gian làm việc..." />
        </div>
      );
    }
    if (isLandingRoute && !isAuthPage) {
      return <LandingPage />;
    }
    return (
      <div className="auth-screen">
        <div className="auth-brand">
          <a className="brand-mark" href="#welcome" aria-label="KTX Care - Trang giới thiệu">K</a>
          <a className="auth-brand-name" href="#welcome">KTX Care<small>QUẢN LÝ KÝ TÚC XÁ</small></a>
        </div>
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
      case 'requests': return <ResidenceRequestsPage />;
      case 'contracts': return <ContractsPage />;
      case 'invoices': return <BillsPage />;
      case 'utilities': return <UtilitiesPage />;
      case 'settings': return <SettingsPage />;
      default: return null;
    }
  })();

  let content;
  if (user.role !== 'STUDENT' && adminPage) {
    const roles = currentPage === 'settings' ? ['ADMIN'] : ADMIN_ROLES;
    content = <RoleBasedRoute roles={roles}>{adminPage}</RoleBasedRoute>;
  } else if (STUDENT_PAGES.includes(currentPage)) {
    content = <RoleBasedRoute roles={['STUDENT']}><StudentPortalPage page={currentPage} params={route.params} /></RoleBasedRoute>;
  } else {
    content = (
      <section className="access-card">
        <span className="access-icon">404</span>
        <h2>Không tìm thấy trang</h2>
        <p>Đường dẫn này không tồn tại trong hệ thống quản lý.</p>
        <a className="button button-primary" href={user.role === 'STUDENT' ? '#my-profile' : '#overview'}>
          {user.role === 'STUDENT' ? 'Về hồ sơ cá nhân' : 'Về tổng quan'}
        </a>
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
