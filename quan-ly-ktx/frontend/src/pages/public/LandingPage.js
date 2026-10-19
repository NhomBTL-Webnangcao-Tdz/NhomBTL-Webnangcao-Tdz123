import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BrandEmblem,
  DashboardSketch,
  DevicesIllustration,
  LineIcon,
  PreviewThumb,
} from './LandingIllustrations';
import './LandingPage.css';

const THEME_KEY = 'ktx_landing_theme';
const REPO_URL = 'https://github.com/NhomBTL-Webnangcao-Tdz/NhomBTL-Webnangcao-Tdz123';

const navLinks = [
  { id: 'gioi-thieu', label: 'Giới thiệu' },
  { id: 'vai-tro', label: 'Tính năng' },
  { id: 'quy-trinh', label: 'Quy trình' },
  { id: 'nhom', label: 'Nhóm' },
];

const guideLinks = [
  { id: 'vai-tro-quan-ly', label: 'Dành cho ban quản lý' },
  { id: 'vai-tro-sinh-vien', label: 'Dành cho sinh viên' },
];

const heroIcons = [
  { name: 'room', className: 'i1' },
  { name: 'calendar', className: 'i2' },
  { name: 'bolt', className: 'i3' },
  { name: 'water', className: 'i4' },
  { name: 'contract', className: 'i5' },
  { name: 'bill', className: 'i6' },
  { name: 'key', className: 'i7' },
  { name: 'chart', className: 'i8' },
  { name: 'wrench', className: 'i9' },
  { name: 'shield', className: 'i10' },
];

const roles = [
  {
    id: 'vai-tro-quan-ly',
    icon: 'shield',
    name: 'Quản trị viên',
    tag: 'ADMIN',
    items: ['Toàn quyền quản lý phòng, sinh viên, hợp đồng', 'Cấu hình đơn giá điện, nước', 'Tạo tài khoản cán bộ quản lý'],
  },
  {
    icon: 'key',
    name: 'Cán bộ quản lý',
    tag: 'MANAGER',
    items: ['Lập, gia hạn, kết thúc hợp đồng', 'Nhập chỉ số điện nước hằng tháng', 'Ghi nhận thanh toán, theo dõi công nợ'],
  },
  {
    id: 'vai-tro-sinh-vien',
    icon: 'user',
    name: 'Sinh viên',
    tag: 'STUDENT',
    items: ['Xem phòng và hợp đồng của mình', 'Xem hóa đơn, lịch sử thanh toán', 'Cập nhật thông tin liên lạc'],
  },
];

const steps = [
  { icon: 'contract', title: 'Lập hợp đồng', text: 'Chọn sinh viên và phòng còn chỗ. Sĩ số phòng được cập nhật theo hợp đồng.' },
  { icon: 'bolt', title: 'Nhập điện nước', text: 'Mỗi tháng nhập chỉ số mới cho từng phòng, hệ thống tính tiền theo đơn giá.' },
  { icon: 'bill', title: 'Theo dõi hóa đơn', text: 'Ban quản lý ghi nhận đã thu, sinh viên xem hóa đơn của mình mọi lúc.' },
];

const previews = [
  { kind: 'rooms', title: 'Sơ đồ phòng', text: 'Phòng trống, còn chỗ, đã đầy hiện bằng màu.' },
  { kind: 'bills', title: 'Hóa đơn', text: 'Lọc theo tháng, tòa nhà và trạng thái thanh toán.' },
  { kind: 'phone', title: 'Cổng sinh viên', text: 'Dùng tốt trên điện thoại.' },
];

const members = ['Chu Thanh Tân', 'Đặng Hải Nam', 'Lê Hải Sơn'];

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage có thể bị chặn, dùng theo hệ thống
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Cuộn tới khối trong trang mà không đổi hash (hash đang dùng cho định tuyến).
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function homeRouteFor(user) {
  return user?.role === 'STUDENT' ? '#my-profile' : '#overview';
}

function LandingNavbar({ theme, onToggleTheme }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const guideRef = useRef(null);

  useEffect(() => {
    if (!guideOpen) return undefined;
    const close = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'mousedown' && guideRef.current?.contains(event.target)) return;
      setGuideOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [guideOpen]);

  const goTo = (id) => {
    setMenuOpen(false);
    setGuideOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="lp-navbar">
      <div className="lp-navbar-inner">
        <a className="lp-logo" href="#home" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span className="brand-mark">K</span>
          <span>KTX Care</span>
        </a>

        <button
          type="button"
          className="lp-menu-button"
          aria-expanded={menuOpen}
          aria-controls="lp-nav-links"
          aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span /><span />
        </button>

        <nav id="lp-nav-links" className={`lp-nav${menuOpen ? ' open' : ''}`} aria-label="Điều hướng trang chủ">
          {navLinks.slice(0, 1).map((link) => (
            <button type="button" className="lp-nav-link" key={link.id} onClick={() => goTo(link.id)}>{link.label}</button>
          ))}
          <div className="lp-dropdown" ref={guideRef}>
            <button
              type="button"
              className="lp-nav-link"
              aria-expanded={guideOpen}
              aria-haspopup="true"
              onClick={() => setGuideOpen((open) => !open)}
            >
              Hướng dẫn <span className="lp-caret" aria-hidden="true">▾</span>
            </button>
            {guideOpen && (
              <div className="lp-dropdown-menu">
                {guideLinks.map((link) => (
                  <button type="button" key={link.id} onClick={() => goTo(link.id)}>{link.label}</button>
                ))}
              </div>
            )}
          </div>
          {navLinks.slice(1).map((link) => (
            <button type="button" className="lp-nav-link" key={link.id} onClick={() => goTo(link.id)}>{link.label}</button>
          ))}
          <a className="lp-nav-link lp-icon-link" href={REPO_URL} target="_blank" rel="noreferrer" aria-label="Mã nguồn trên GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" /></svg>
          </a>
          <button
            type="button"
            className="lp-nav-link lp-icon-link"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" /></svg>
          </button>
          <div className="lp-nav-actions">
            {user ? (
              <a className="lp-btn lp-btn-small lp-btn-primary" href={homeRouteFor(user)}>Vào hệ thống</a>
            ) : (
              <>
                <a className="lp-btn lp-btn-small lp-btn-ghost" href="#login">Đăng nhập</a>
                <a className="lp-btn lp-btn-small lp-btn-primary" href="#register">Đăng ký</a>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function LandingHero() {
  const { user } = useAuth();
  return (
    <section className="lp-hero" id="gioi-thieu" aria-labelledby="lp-hero-title">
      <div className="lp-hero-icons" aria-hidden="true">
        {heroIcons.map((icon) => (
          <span key={icon.name} className={`lp-float ${icon.className}`}><LineIcon name={icon.name} size={22} /></span>
        ))}
      </div>
      <div className="lp-hero-content">
        <BrandEmblem />
        <h1 id="lp-hero-title">KTX Care</h1>
        <p className="lp-tagline">Quản lý ký túc xá, gọn trong một nơi.</p>
        <div className="lp-hero-actions">
          {user ? (
            <a className="lp-btn lp-btn-primary" href={homeRouteFor(user)}>Vào hệ thống</a>
          ) : (
            <a className="lp-btn lp-btn-primary" href="#login">Đăng nhập</a>
          )}
          <button type="button" className="lp-btn lp-btn-outline" onClick={() => scrollToSection('he-thong')}>Tìm hiểu thêm</button>
        </div>
      </div>
      <div className="lp-hero-devices">
        <DevicesIllustration />
        <ul className="lp-platforms" aria-label="Dùng được trên">
          <li><LineIcon name="laptop" size={16} />Máy tính</li>
          <li><LineIcon name="phone" size={16} />Điện thoại</li>
          <li><LineIcon name="tablet" size={16} />Máy tính bảng</li>
        </ul>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState(readStoredTheme);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // không lưu được thì chỉ đổi trong phiên này
    }
  };

  return (
    <div className="lp-root" data-theme={theme}>
      <LandingNavbar theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <LandingHero />

        <section className="lp-section lp-split" id="he-thong" aria-labelledby="lp-system-title">
          <div className="lp-split-text">
            <h2 id="lp-system-title">Một hệ thống cho ban quản lý và sinh viên</h2>
            <p>
              KTX Care gom phòng ở, hồ sơ sinh viên, hợp đồng, chỉ số điện nước và hóa đơn vào một chỗ,
              thay cho sổ sách và các file Excel rời rạc.
            </p>
            <p>
              Ban quản lý làm việc trên máy tính với bảng điều khiển đầy đủ. Sinh viên đăng nhập bằng
              tài khoản riêng để xem thông tin lưu trú của mình.
            </p>
          </div>
          <DashboardSketch />
        </section>

        <section className="lp-section lp-tinted" id="vai-tro" aria-labelledby="lp-roles-title">
          <h2 id="lp-roles-title" className="lp-center">Đúng việc cho từng vai trò</h2>
          <p className="lp-lead lp-center">
            Ba vai trò với quyền riêng: mỗi tài khoản chỉ thấy và làm những việc thuộc phần của mình.
          </p>
          <div className="lp-cards three">
            {roles.map((role) => (
              <article className="lp-card" id={role.id} key={role.tag}>
                <span className="lp-card-icon"><LineIcon name={role.icon} /></span>
                <h3>{role.name}</h3>
                <span className="lp-role-tag">{role.tag}</span>
                <ul>
                  {role.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-section" id="quy-trinh" aria-labelledby="lp-flow-title">
          <h2 id="lp-flow-title" className="lp-center">Quy trình lưu trú</h2>
          <p className="lp-lead lp-center">Từ lúc sinh viên nhận phòng đến khi đóng tiền, mọi bước đều được ghi lại.</p>
          <ol className="lp-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="lp-step-icon"><LineIcon name={step.icon} size={28} /></span>
                <span className="lp-step-number">Bước {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="lp-section lp-tinted" id="xem-nhanh" aria-labelledby="lp-preview-title">
          <h2 id="lp-preview-title" className="lp-center">Xem nhanh</h2>
          <div className="lp-cards three">
            {previews.map((preview) => (
              <article className="lp-preview" key={preview.kind}>
                <PreviewThumb kind={preview.kind} />
                <h3>{preview.title}</h3>
                <p>{preview.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-section lp-team" id="nhom" aria-labelledby="lp-team-title">
          <h2 id="lp-team-title" className="lp-center">Bài tập lớn môn Phát triển Ứng dụng Web Nâng cao</h2>
          <p className="lp-lead lp-center">Dự án của nhóm sinh viên, giảng viên hướng dẫn @lethunguyen.</p>
          <ul className="lp-members">
            {members.map((name) => (
              <li key={name}>
                <span className="lp-avatar" aria-hidden="true">{name.split(' ').pop().slice(0, 1)}</span>
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="lp-cta" aria-labelledby="lp-cta-title">
          <h2 id="lp-cta-title">Bắt đầu sử dụng KTX Care</h2>
          <p>Sinh viên tự tạo tài khoản. Tài khoản cán bộ do quản trị viên cấp.</p>
          <div className="lp-hero-actions">
            {user ? (
              <a className="lp-btn lp-btn-primary" href={homeRouteFor(user)}>Vào hệ thống</a>
            ) : (
              <>
                <a className="lp-btn lp-btn-primary" href="#register">Tạo tài khoản sinh viên</a>
                <a className="lp-btn lp-btn-outline on-dark" href="#login">Đăng nhập</a>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-cols">
          <div>
            <h3>Sản phẩm</h3>
            <button type="button" onClick={() => scrollToSection('gioi-thieu')}>Giới thiệu</button>
            <button type="button" onClick={() => scrollToSection('vai-tro')}>Tính năng</button>
            <button type="button" onClick={() => scrollToSection('quy-trinh')}>Quy trình</button>
          </div>
          <div>
            <h3>Tài khoản</h3>
            <a href="#login">Đăng nhập</a>
            <a href="#register">Đăng ký sinh viên</a>
          </div>
          <div>
            <h3>Nhóm phát triển</h3>
            {members.map((name) => <span key={name}>{name}</span>)}
          </div>
          <div>
            <h3>Mã nguồn</h3>
            <a href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span className="brand-mark">K</span>
          <p>© 2026 Nhóm BTL Web Nâng cao · KTX Care</p>
        </div>
      </footer>
    </div>
  );
}
