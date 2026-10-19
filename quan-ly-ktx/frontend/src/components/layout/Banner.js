const bannerCopy = {
  overview: ['', 'Chào mừng trở lại', 'Quản lý vận hành ký túc xá hiệu quả, rõ ràng và thuận tiện.'],
  rooms: ['SƠ ĐỒ TÒA NHÀ', 'Quản lý Tòa nhà & Phòng', 'Theo dõi tình trạng phòng và công suất sử dụng theo từng tòa.'],
  students: ['HỒ SƠ LƯU TRÚ', 'Quản lý Sinh viên', 'Thông tin sinh viên, phòng ở và hồ sơ lưu trú.'],
  contracts: ['THỜI HẠN LƯU TRÚ', 'Quản lý Hợp đồng', 'Theo dõi hợp đồng còn hiệu lực và thời hạn sắp kết thúc.'],
  invoices: ['THU CHI & CÔNG NỢ', 'Hóa đơn & Dịch vụ', 'Theo dõi hóa đơn, chi phí điện nước và tình trạng thanh toán.'],
  utilities: ['CHỐT CHỈ SỐ HÀNG THÁNG', 'Điện & Nước', 'Ghi nhận chỉ số công tơ và theo dõi lượng tiêu thụ.'],
  settings: ['THIẾT LẬP HỆ THỐNG', 'Cài đặt', 'Cấu hình kết nối và thông tin tài khoản quản lý.'],
  'my-profile': ['CỔNG SINH VIÊN', 'Hồ sơ cá nhân', 'Xem thông tin tài khoản của bạn.'],
  'my-room': ['CỔNG SINH VIÊN', 'Phòng của tôi', 'Thông tin lưu trú và phòng ở hiện tại.'],
  'my-bills': ['CỔNG SINH VIÊN', 'Hóa đơn của tôi', 'Theo dõi các hóa đơn và khoản cần thanh toán.'],
  login: ['KTX CARE', 'Chào mừng đến với KTX Care', 'Đăng nhập để truy cập không gian quản lý của bạn.'],
  register: ['KTX CARE', 'Tạo tài khoản', 'Đăng ký tài khoản sinh viên để tiếp tục.'],
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
