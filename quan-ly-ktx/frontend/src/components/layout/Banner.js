const bannerCopy = {
  overview: ['', 'Chào mừng trở lại', 'Quản lý vận hành ký túc xá hiệu quả, rõ ràng và thuận tiện.'],
  'my-profile': ['CỔNG SINH VIÊN', 'Hồ sơ cá nhân', 'Xem thông tin tài khoản của bạn.'],
};

export default function Banner({ currentPage }) {
  const [eyebrow, title, subtitle] = bannerCopy[currentPage] || bannerCopy.overview;
  const bannerImage = `${process.env.PUBLIC_URL}/images/banner-ktx.png`;

  return (
    <section
      className="welcome-banner"
      aria-labelledby="banner-title"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 90, 95, 0.45), rgba(0, 90, 95, 0.45)), url("${bannerImage}")`,
      }}
    >
      <span className="banner-shape banner-shape-one" aria-hidden="true" />
      <span className="banner-shape banner-shape-two" aria-hidden="true" />
      <span className="banner-shape banner-shape-three" aria-hidden="true" />
      <div className="banner-copy">
        <p className="banner-eyebrow">{eyebrow}</p>
        <h1 id="banner-title">{title}</h1>
        <p>{subtitle}</p>
      </div>
      <span className="banner-indicators" aria-hidden="true"><i /><i /><i /></span>
    </section>
  );
}
