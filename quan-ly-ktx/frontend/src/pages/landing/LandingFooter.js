import './LandingFooter.css';

const footerGroups = [
  {
    title: 'TỔNG QUAN',
    links: [
      { label: 'Giới thiệu KTX Care', href: '#gioi-thieu' },
      { label: 'Ban quản lý', href: '#login' },
      { label: 'Sinh viên', href: '#login' },
    ],
  },
  {
    title: 'LIÊN HỆ',
    links: [
      { label: 'Liên hệ ban quản lý', href: '#login' },
      { label: 'Hỗ trợ sinh viên', href: '#login' },
      { label: 'Gửi yêu cầu hỗ trợ', href: '#login' },
    ],
  },
  {
    title: 'TRUY CẬP',
    links: [
      { label: 'Đăng nhập', href: '#login' },
      { label: 'Đăng ký tài khoản', href: '#register' },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="landing-footer" id="lien-he">
      <div className="landing-footer-columns">
        {footerGroups.map((group) => (
          <section className="landing-footer-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map((link) => <a href={link.href} key={link.label}>{link.label}</a>)}
          </section>
        ))}
      </div>
      <div className="landing-footer-brand">
        <a className="landing-brand" href="#welcome">
          <span className="landing-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40">
              <ellipse cx="20" cy="20" rx="17" ry="7" />
              <ellipse cx="20" cy="20" rx="17" ry="7" transform="rotate(60 20 20)" />
              <ellipse cx="20" cy="20" rx="17" ry="7" transform="rotate(120 20 20)" />
              <circle cx="20" cy="20" r="2.6" />
            </svg>
          </span>
          <span>KTX Care</span>
        </a>
        <span>Không gian kết nối quản lý và sinh viên.</span>
      </div>
      <p className="landing-copyright">© 2026 KTX Care · Hệ thống quản lý ký túc xá</p>
    </footer>
  );
}
