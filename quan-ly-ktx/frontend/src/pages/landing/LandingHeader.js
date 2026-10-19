import LandingNavigation from './LandingNavigation';
import './LandingHeader.css';

export default function LandingHeader() {
  return (
    <header className="landing-header">
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
      <LandingNavigation />
      <div className="landing-header-actions">
        <a className="landing-icon-link" href="#lien-he" aria-label="GitHub">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.12.08 1.71 1.14 1.71 1.14 1 .1.62 2.54 3.25 1.87.1-.73.4-1.22.72-1.5-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.06 1.14a10.64 10.64 0 0 1 5.57 0c2.12-1.44 3.06-1.14 3.06-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.23-5.1 5.5.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
          </svg>
        </a>
        <span className="landing-theme-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
            <circle cx="12" cy="12" r="4.5" />
          </svg>
        </span>
        <a className="landing-header-login" href="#login">Đăng nhập</a>
      </div>
    </header>
  );
}
