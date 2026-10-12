import { useEffect, useState } from 'react';
import './App.css';

const navigationItems = [
  { id: 'overview', label: 'Tổng quan', mark: 'TQ', description: 'Tổng quan và truy cập nhanh các chức năng quản lý ký túc xá.' },
  { id: 'rooms', label: 'Phòng ở', mark: 'P', description: 'Quản lý phòng, tòa nhà, sức chứa và tình trạng lưu trú.' },
  { id: 'students', label: 'Sinh viên', mark: 'SV', description: 'Quản lý hồ sơ sinh viên đang và đã lưu trú tại ký túc xá.' },
  { id: 'contracts', label: 'Hợp đồng', mark: 'HD', description: 'Theo dõi hợp đồng thuê phòng và thời hạn lưu trú.' },
  { id: 'utility-bills', label: 'Hóa đơn điện nước', mark: 'ĐN', description: 'Theo dõi chỉ số điện nước và hóa đơn theo từng phòng.' },
];

function getCurrentPage() {
  const pageId = window.location.hash.slice(1);
  return navigationItems.some(({ id }) => id === pageId) ? pageId : 'overview';
}

function App() {
  const [currentPage, setCurrentPage] = useState(getCurrentPage);
  const currentItem = navigationItems.find(({ id }) => id === currentPage);

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(getCurrentPage());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Điều hướng chính">
        <a className="brand" href="#overview" aria-label="KTX Care - Tổng quan">
          <span className="brand-mark" aria-hidden="true">K</span>
          <span className="brand-copy">
            <strong>KTX Care</strong>
            <small>QUẢN LÝ KÝ TÚC XÁ</small>
          </span>
        </a>

        <div className="nav-label">MENU</div>
        <nav className="main-nav">
          {navigationItems.map(({ id, label, mark }) => (
            <a
              className={`nav-link${currentPage === id ? ' active' : ''}`}
              href={`#${id}`}
              key={id}
              aria-current={currentPage === id ? 'page' : undefined}
            >
              <span className="nav-mark" aria-hidden="true">{mark}</span>
              <span>{label}</span>
              {currentPage === id && <span className="active-indicator" aria-hidden="true" />}
            </a>
          ))}
        </nav>

        <div className="sidebar-note">
          <span className="status-dot" aria-hidden="true" />
          <span>Hệ thống quản lý KTX</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Quản lý ký túc xá</span>
            <span className="breadcrumb-divider" aria-hidden="true">/</span>
            <strong>{currentItem.label}</strong>
          </div>
          <div className="admin-badge">
            <span className="admin-avatar" aria-hidden="true">QL</span>
            <span className="admin-label">Quản trị viên</span>
          </div>
        </header>

        <section className="page-content" aria-live="polite">
          <div className="page-heading">
            <div>
              <p className="eyebrow">KHÔNG GIAN QUẢN LÝ</p>
              <h1>{currentPage === 'overview' ? 'Chào mừng đến với KTX Care' : currentItem.label}</h1>
              <p className="page-description">
                {currentPage === 'overview'
                  ? 'Chọn một chức năng từ menu để bắt đầu quản lý ký túc xá.'
                  : currentItem.description}
              </p>
            </div>
            <span className="heading-decoration" aria-hidden="true">K</span>
          </div>

          {currentPage === 'overview' ? (
            <div className="module-grid" aria-label="Các chức năng quản lý">
              {navigationItems.filter(({ id }) => id !== 'overview').map(({ id, label, mark, description }) => (
                <a className="module-card" href={`#${id}`} key={id}>
                  <span className="module-mark" aria-hidden="true">{mark}</span>
                  <span className="module-card-title">{label}</span>
                  <span className="module-card-description">{description}</span>
                  <span className="module-card-action">Mở chức năng <span aria-hidden="true">→</span></span>
                </a>
              ))}
            </div>
          ) : (
            <div className="empty-module">
              <span className="empty-module-mark" aria-hidden="true">{currentItem.mark}</span>
              <h2>Khu vực {currentItem.label.toLowerCase()}</h2>
              <p>
                Menu điều hướng đã sẵn sàng. Giao diện dữ liệu của chức năng này sẽ hiển thị
                khi frontend được kết nối với API tương ứng.
              </p>
              <a className="back-link" href="#overview">← Trở về tổng quan</a>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
