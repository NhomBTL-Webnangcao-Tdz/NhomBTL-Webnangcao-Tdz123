import PageHeading from '../../components/common/PageHeading';
import './ContactPage.css';

const managerEmail = process.env.REACT_APP_MANAGER_EMAIL || '';
const managerPhone = process.env.REACT_APP_MANAGER_PHONE || '';

export default function ContactPage({ user, params }) {
  const isRoomRequest = params?.get('type') === 'room';
  const subject = isRoomRequest ? 'Đăng ký ở ký túc xá' : 'Liên hệ hỗ trợ ký túc xá';
  const body = `${isRoomRequest ? 'Tôi muốn đăng ký ở ký túc xá.' : 'Tôi cần hỗ trợ.'}\n\nTên đăng nhập: ${user?.username || ''}\nMã tài khoản: ${user?.id || ''}\nNội dung: `;
  const emailHref = `mailto:${managerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <>
      <PageHeading eyebrow="CỔNG SINH VIÊN" title="Liên hệ quản lý" description="Liên hệ ban quản lý khi cần hỗ trợ lưu trú." />
      <section className="student-contact-grid">
        <article className="panel student-contact-card">
          <span className="student-contact-icon" aria-hidden="true">✉</span>
          <h3>Email ban quản lý</h3>
          {managerEmail
            ? <><p>{managerEmail}</p><a className="button button-primary" href={emailHref}>Soạn email liên hệ</a></>
            : <p>Thông tin email chưa được cấu hình. Vui lòng liên hệ trực tiếp tại văn phòng ban quản lý.</p>}
        </article>
        <article className="panel student-contact-card">
          <span className="student-contact-icon" aria-hidden="true">☎</span>
          <h3>Điện thoại ban quản lý</h3>
          {managerPhone
            ? <><p>{managerPhone}</p><a className="button button-secondary" href={`tel:${managerPhone.replace(/[^\d+]/g, '')}`}>Gọi ban quản lý</a></>
            : <p>Thông tin điện thoại chưa được cấu hình. Vui lòng liên hệ trực tiếp tại văn phòng ban quản lý.</p>}
        </article>
      </section>
    </>
  );
}
