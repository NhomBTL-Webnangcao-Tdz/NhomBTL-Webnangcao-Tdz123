import Nav from 'react-bootstrap/Nav';
import './LandingNavigation.css';

export default function LandingNavigation() {
  return (
    <Nav as="nav" className="landing-nav" aria-label="Điều hướng chính">
      <Nav.Link className="landing-nav-dropdown" href="#welcome">Tổng quan <span aria-hidden="true" /></Nav.Link>
      <Nav.Link href="#gioi-thieu">Giới thiệu</Nav.Link>
      <Nav.Link href="#lien-he">Cộng tác</Nav.Link>
      <Nav.Link href="#lien-he">Cộng đồng</Nav.Link>
      <Nav.Link href="#gioi-thieu">Góc KTX</Nav.Link>
      <Nav.Link href="#lien-he">Tin tức</Nav.Link>
    </Nav>
  );
}
