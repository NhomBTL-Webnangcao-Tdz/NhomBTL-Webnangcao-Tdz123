import './LandingPage.css';
import LandingFooter from './LandingFooter';
import LandingHeader from './LandingHeader';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingHeader />

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-pattern" aria-hidden="true">
            <span className="pattern-symbol symbol-home">⌂</span>
            <span className="pattern-symbol symbol-book">▤</span>
            <span className="pattern-symbol symbol-room">▦</span>
            <span className="pattern-symbol symbol-bill">▱</span>
            <span className="pattern-symbol symbol-notice">◇</span>
            <span className="pattern-symbol symbol-key">⌑</span>
          </div>
          <div className="landing-hero-content">
            <span className="landing-hero-mark" aria-hidden="true">
              <svg viewBox="0 0 72 72" fill="none">
                <path d="M12 31 36 12l24 19v29H12V31Z" />
                <path d="M28 60V42h16v18M21 34h8v7h-8zM43 34h8v7h-8z" />
                <path d="M8 31 36 8l28 23" />
              </svg>
            </span>
            <h1 id="landing-title">KTX Care</h1>
            <p>Quản lý ký túc xá dễ dàng. Kết nối cuộc sống sinh viên.</p>
            <div className="landing-hero-actions">
              <a className="landing-button landing-button-primary" href="#login">Bắt đầu sử dụng</a>
              <a className="landing-button landing-button-secondary" href="#gioi-thieu">Tìm hiểu thêm</a>
            </div>
          </div>
          <div className="landing-devices" aria-label="Minh họa cổng quản lý ký túc xá" role="img">
            <div className="device-laptop">
              <div className="laptop-screen">
                <div className="mini-sidebar"><i /><i /><i /><i /></div>
                <div className="mini-dashboard">
                  <b>Tổng quan ký túc xá</b>
                  <div className="mini-stats"><i /><i /><i /></div>
                  <div className="mini-chart"><i /><i /><i /><i /><i /><i /></div>
                </div>
              </div>
              <div className="laptop-base" />
            </div>
            <div className="device-phone phone-one">
              <div className="phone-speaker" />
              <div className="phone-screen">
                <b>Phòng của tôi</b><i /><i /><i /><i />
                <span className="phone-room">A-204</span>
              </div>
            </div>
            <div className="device-phone phone-two">
              <div className="phone-speaker" />
              <div className="phone-screen">
                <b>Hóa đơn</b><i /><i /><i />
                <span className="phone-paid">Đã xác nhận</span>
              </div>
            </div>
            <div className="device-browser">
              <div className="browser-bar"><i /><i /><i /><span>KTX Care · Cổng sinh viên</span></div>
              <div className="browser-content">
                <div className="browser-banner"><b>Chào mừng trở về</b><i /><i /></div>
                <div className="browser-cards"><i /><i /><i /></div>
              </div>
            </div>
            <div className="device-platform" />
          </div>
        </section>

        <section className="landing-introduction" id="gioi-thieu">
          <div className="introduction-heading">
            <span className="landing-section-eyebrow">VỀ KTX CARE</span>
            <h2>Một mái nhà chung,<br /><span>được kết nối tốt hơn.</span></h2>
          </div>
          <div className="introduction-copy">
            <p><strong>KTX Care là không gian quản lý và kết nối dành cho cộng đồng ký túc xá.</strong> Hệ thống được xây dựng để việc quản lý nơi ở trở nên rõ ràng, thuận tiện, đồng thời giúp sinh viên chủ động hơn trong cuộc sống hàng ngày.</p>
            <p>Từ lúc đăng ký lưu trú, nhận phòng cho đến theo dõi thông tin cá nhân và các khoản cần thanh toán, thông tin được đưa về một nơi thống nhất. Ban quản lý có thể theo dõi tình hình vận hành; sinh viên có thể xem các thông tin liên quan đến mình mà không phải tìm kiếm qua nhiều kênh riêng lẻ.</p>
            <p>Chúng tôi hướng đến trải nghiệm đơn giản, minh bạch và gần gũi: mỗi yêu cầu có thể được theo dõi, mỗi thông báo đến đúng người, và những trao đổi trong môi trường ký túc xá trở nên liền mạch hơn.</p>
          </div>
        </section>

        <section className="landing-purpose" aria-labelledby="purpose-heading">
          <div className="purpose-heading">
            <span className="landing-section-eyebrow">CÙNG XÂY DỰNG MÔI TRƯỜNG TỐT HƠN</span>
            <h2 id="purpose-heading">Để cuộc sống ở ký túc xá<br />trở nên nhẹ nhàng hơn</h2>
            <p>KTX Care mang đến một cách làm việc rõ ràng cho ban quản lý và một điểm truy cập thuận tiện cho mỗi sinh viên.</p>
          </div>
          <div className="purpose-grid">
            <article className="purpose-card">
              <span className="purpose-card-number">01</span>
              <div className="purpose-card-icon" aria-hidden="true">⌂</div>
              <h3>Không gian được tổ chức</h3>
              <p>Thông tin về khu nhà và phòng ở được trình bày mạch lạc, giúp ban quản lý nắm bắt tình hình lưu trú và hỗ trợ sinh viên kịp thời.</p>
            </article>
            <article className="purpose-card">
              <span className="purpose-card-number">02</span>
              <div className="purpose-card-icon purpose-card-icon-teal" aria-hidden="true">↔</div>
              <h3>Thông tin minh bạch</h3>
              <p>Các cập nhật, yêu cầu và khoản cần theo dõi có ngữ cảnh rõ ràng, để cả sinh viên lẫn người quản lý dễ dàng phối hợp.</p>
            </article>
            <article className="purpose-card">
              <span className="purpose-card-number">03</span>
              <div className="purpose-card-icon purpose-card-icon-gold" aria-hidden="true">♡</div>
              <h3>Trải nghiệm lấy sinh viên làm trọng tâm</h3>
              <p>Sinh viên có thể chủ động tiếp cận thông tin thiết yếu về nơi ở và trao đổi với ban quản lý trong suốt thời gian lưu trú.</p>
            </article>
          </div>
        </section>

        <section className="landing-connection">
          <div className="connection-mark" aria-hidden="true">
            <span>Q</span><i /><span>S</span>
          </div>
          <div>
            <span className="landing-section-eyebrow">MỘT CỘNG ĐỒNG, MỘT KHÔNG GIAN CHUNG</span>
            <h2>Kết nối ban quản lý<br />và sinh viên mỗi ngày.</h2>
            <p>Ký túc xá không chỉ là nơi ở. Đó còn là nơi học tập, trưởng thành và sẻ chia. KTX Care đồng hành cùng cộng đồng ấy bằng một nền tảng dễ tiếp cận, nơi việc quản lý và trải nghiệm sinh viên gặp nhau trong cùng một hành trình.</p>
            <a className="landing-button landing-button-primary" href="#login">Khám phá KTX Care</a>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
