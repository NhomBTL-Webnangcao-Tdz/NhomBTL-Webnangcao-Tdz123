import PageHeading from '../../components/common/PageHeading';
import { useAuth } from '../../context/AuthContext';

const portalContent = {
  'my-room': {
    title: 'Phòng của tôi',
    description: 'Thông tin phòng và hợp đồng lưu trú hiện tại.',
    limitation: 'Backend hiện chưa cung cấp endpoint để tra cứu phòng/hợp đồng theo tài khoản sinh viên.',
  },
  'my-bills': {
    title: 'Hóa đơn của tôi',
    description: 'Các khoản phí và lịch sử thanh toán cá nhân.',
    limitation: 'Backend hiện chưa liên kết hóa đơn với tài khoản sinh viên hoặc cung cấp endpoint hóa đơn cá nhân.',
  },
};

export default function StudentPortalPage({ page }) {
  const { user } = useAuth();
  if (page === 'my-profile') {
    return (
      <>
        <PageHeading eyebrow="CỔNG SINH VIÊN" title="Hồ sơ cá nhân" description="Thông tin tài khoản sinh viên đã đăng nhập." />
        <section className="panel profile-panel">
          <span className="identity-avatar large">{user?.username?.slice(0, 1)?.toUpperCase() || 'S'}</span>
          <dl className="detail-list">
            <div><dt>Tên đăng nhập</dt><dd>{user?.username || '—'}</dd></div>
            <div><dt>Mã tài khoản</dt><dd>{user?.id || '—'}</dd></div>
            <div><dt>Vai trò</dt><dd>{user?.role || '—'}</dd></div>
          </dl>
          <p className="form-hint">API hồ sơ tài khoản hiện không chứa thông tin liên lạc hoặc hồ sơ sinh viên mở rộng.</p>
        </section>
      </>
    );
  }

  const content = portalContent[page] || portalContent['my-room'];
  return (
    <>
      <PageHeading eyebrow="CỔNG SINH VIÊN" title={content.title} description={content.description} />
      <section className="panel limitation-panel">
        <span className="access-icon">i</span>
        <h3>Chưa có dữ liệu cá nhân</h3>
        <p>{content.limitation}</p>
        <p>Phần này sẽ hiển thị dữ liệu ngay khi backend bổ sung quan hệ giữa tài khoản, sinh viên, phòng và hóa đơn.</p>
      </section>
    </>
  );
}
