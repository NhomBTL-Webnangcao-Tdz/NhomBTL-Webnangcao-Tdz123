import { useEffect, useState } from 'react';
import './App.css';
import AppLayout from './components/layout/AppLayout';
import RoleBasedRoute from './components/guards/RoleBasedRoute';
import { AuthProvider } from './context/AuthContext';
import BillsPage from './pages/admin/BillsPage';
import ContractsPage from './pages/admin/ContractsPage';
import DashboardPage from './pages/admin/DashboardPage';
import RoomsPage from './pages/admin/RoomsPage';
import SettingsPage from './pages/admin/SettingsPage';
import StudentsPage from './pages/admin/StudentsPage';
import UtilitiesPage from './pages/admin/UtilitiesPage';
import LoginPage from './pages/auth/LoginPage';
import StudentPortalPage from './pages/student/StudentPortalPage';
import { getHashRoute } from './utils/hashRoute';

const ADMIN_ROLES = ['ADMIN', 'MANAGER'];
const aliases = {
  home: 'overview',
  dashboard: 'overview',
  'utility-bills': 'invoices',
};

function RoutedContent() {
  const [route, setRoute] = useState(getHashRoute);

  useEffect(() => {
    const handleRouteChange = () => setRoute(getHashRoute());
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  const currentPage = aliases[route.page] || route.page;
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
  if (currentPage === 'login') {
    content = <LoginPage />;
  } else if (adminPage) {
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
