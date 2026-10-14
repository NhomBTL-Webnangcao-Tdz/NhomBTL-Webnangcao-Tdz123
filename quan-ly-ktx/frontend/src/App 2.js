import { Container, Nav, Navbar } from 'react-bootstrap';
import { BrowserRouter, NavLink, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Footer from './Footer';

const sections = [
  {
    path: '/rooms',
    label: 'Phòng',
    description: 'Theo dõi thông tin phòng, tòa nhà, sức chứa và giá thuê.',
  },
  {
    path: '/students',
    label: 'Sinh viên',
    description: 'Quản lý hồ sơ và thông tin liên hệ của sinh viên.',
  },
  {
    path: '/contracts',
    label: 'Hợp đồng',
    description: 'Theo dõi hợp đồng lưu trú và thời hạn thuê phòng.',
  },
  {
    path: '/utility-bills',
    label: 'Hóa đơn điện nước',
    description: 'Quản lý chỉ số điện, nước và trạng thái thanh toán.',
  },
  {
    path: '/payments',
    label: 'Thanh toán',
    description: 'Theo dõi các khoản thanh toán tiền phòng và tiền cọc.',
  },
];

function Dashboard() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">TỔNG QUAN</p>
        <h1>Quản lý ký túc xá</h1>
        <p className="page-description">
          Chọn một mục bên dưới để bắt đầu quản lý hệ thống.
        </p>
      </div>
      <div className="section-grid">
        {sections.map((section) => (
          <Link
            className="section-card"
            key={section.path}
            to={section.path}
          >
            <span className="section-card-arrow" aria-hidden="true">
              →
            </span>
            <h2>{section.label}</h2>
            <p>{section.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

function SectionPage({ section }) {
  return (
    <div className="page-heading">
      <p className="eyebrow">QUẢN LÝ KÝ TÚC XÁ</p>
      <h1>{section.label}</h1>
      <p className="page-description">{section.description}</p>
      <div className="coming-soon" role="status">
        Trang quản lý {section.label.toLowerCase()} đang được phát triển.
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="page-heading">
      <p className="eyebrow">404</p>
      <h1>Không tìm thấy trang</h1>
      <p className="page-description">
        Đường dẫn không tồn tại. Hãy quay lại trang tổng quan.
      </p>
      <Link className="back-link" to="/">
        Về trang tổng quan
      </Link>
    </div>
  );
}

function AppContent() {
  return (
    <div className="app-shell">
      <Navbar bg="white" expand="lg" className="app-navbar">
        <Container>
          <Navbar.Brand as={NavLink} to="/" end className="brand">
            <span className="brand-mark" aria-hidden="true">
              K
            </span>
            KTX Manager
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navigation" />
          <Navbar.Collapse id="main-navigation">
            <Nav className="ms-auto">
              <Nav.Link as={NavLink} to="/" end>
                Tổng quan
              </Nav.Link>
              {sections.map((section) => (
                <Nav.Link as={NavLink} to={section.path} key={section.path}>
                  {section.label}
                </Nav.Link>
              ))}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="main-content">
        <Container>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {sections.map((section) => (
              <Route
                key={section.path}
                path={section.path}
                element={<SectionPage section={section} />}
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
