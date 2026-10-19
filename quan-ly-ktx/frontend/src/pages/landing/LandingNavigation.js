import './LandingNavigation.css';

export default function LandingNavigation() {
  return (
    <nav className="landing-nav" aria-label="Điều hướng chính">
      <a className="landing-nav-dropdown" href="#welcome">Tổng quan <span aria-hidden="true" /></a>
      <a href="#gioi-thieu">Giới thiệu</a>
      <a href="#lien-he">Cộng tác</a>
      <a href="#lien-he">Cộng đồng</a>
      <a href="#gioi-thieu">Góc KTX</a>
      <a href="#lien-he">Tin tức</a>
    </nav>
  );
}
