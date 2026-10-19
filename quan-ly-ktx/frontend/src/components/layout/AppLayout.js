import Sidebar from './Sidebar';
import Header from './Header';
import Banner from './Banner';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout({ currentPage, children }) {
  const { user } = useAuth();
  const isHomePage = currentPage === 'overview'
    || (user?.role === 'STUDENT' && currentPage === 'my-profile');
  return (
    <div className={`app-shell${user?.role === 'STUDENT' ? ' student-shell' : ''}`}>
      <Sidebar currentPage={currentPage} />
      <div className="main-area">
        <Header currentPage={currentPage} />
        {isHomePage && <Banner currentPage={currentPage} />}
        <main className="page-content" aria-live="polite">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
