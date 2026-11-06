import { ErrorState, LoadingState } from '../../components/common/AsyncState';
import PageHeading from '../../components/common/PageHeading';
import { formatDate, getBillStatus } from './studentPageUtils';
import './StudentDashboardPage.css';

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} ₫`;
}

export default function StudentDashboardPage({ portal, loading, error, retry }) {
  const bills = portal?.bills || [];
  const unpaidTotal = bills.reduce((total, bill) => total + Number(bill.total_amount || 0), 0);

  return (
    <>
      <PageHeading
        eyebrow="CỔNG SINH VIÊN"
        title="Tổng quan sinh viên"
        description="Theo dõi nhanh thông tin phòng, thời hạn hợp đồng và các khoản cần thanh toán."
      />
      {loading ? <section className="panel"><LoadingState message="Đang tải thông tin tổng quan..." /></section>
        : error ? <section className="panel"><ErrorState message={error} onRetry={retry} /></section>
          : !portal?.linked ? (
            <section className="panel student-empty-panel">
              <span className="student-empty-icon" aria-hidden="true">♙</span>
              <h3>Hoàn thiện hồ sơ để xem thông tin lưu trú</h3>
              <p>Liên kết hồ sơ sinh viên để theo dõi phòng, hợp đồng và hóa đơn của bạn.</p>
              <a className="button button-primary" href="#my-profile">Hoàn thiện hồ sơ cá nhân</a>
            </section>
          ) : (
            <>
              <section className="student-summary-grid" aria-label="Thông tin lưu trú">
                <article className="panel student-summary-card">
                  <span className="student-summary-icon teal" aria-hidden="true">▦</span>
                  <span className="student-summary-label">Phòng hiện tại</span>
                  <strong>{portal.room ? portal.room.roomNumber : 'Chưa xếp phòng'}</strong>
                  <span className="student-summary-foot">{portal.room?.building || 'Gửi yêu cầu lưu trú để được xếp phòng.'}</span>
                  <a href="#my-room">Xem thông tin phòng <span aria-hidden="true">→</span></a>
                </article>
                <article className="panel student-summary-card">
                  <span className="student-summary-icon blue" aria-hidden="true">▤</span>
                  <span className="student-summary-label">Hạn hợp đồng</span>
                  <strong>{portal.contract ? formatDate(portal.contract.end_date) : 'Chưa có hợp đồng'}</strong>
                  <span className="student-summary-foot">{portal.contract ? `HĐ-${String(portal.contract.contract_id).padStart(4, '0')}` : 'Thông tin sẽ hiện khi hợp đồng có hiệu lực.'}</span>
                  <a href="#my-room">Xem hợp đồng <span aria-hidden="true">→</span></a>
                </article>
                <article className="panel student-summary-card">
                  <span className="student-summary-icon amber" aria-hidden="true">▧</span>
                  <span className="student-summary-label">Hóa đơn chưa đóng</span>
                  <strong>{bills.length}</strong>
                  <span className="student-summary-foot">Tổng cần thanh toán: {formatCurrency(unpaidTotal)}</span>
                  <a href="#my-bills">Xem hóa đơn <span aria-hidden="true">→</span></a>
                </article>
              </section>
              <section className="panel student-summary-bills">
                <div className="student-panel-heading">
                  <div><h3>Các khoản chưa thanh toán</h3><p>Hóa đơn đang chờ thanh toán của bạn.</p></div>
                  <a href="#my-bills" className="text-link">Tất cả hóa đơn</a>
                </div>
                {bills.length ? (
                  <ul className="student-summary-bill-list">
                    {bills.slice(0, 5).map((bill) => (
                      <li key={bill.bill_id}>
                        <span className="student-summary-bill-copy">
                          <strong>{bill.title || (bill.billType === 'GENERAL' ? 'Khoản thu khác' : `Hóa đơn tháng ${bill.month}/${bill.year}`)}</strong>
                          <small>Hạn thanh toán: {formatDate(bill.dueDate)} · {getBillStatus(bill.dueDate)}</small>
                        </span>
                        <strong className="student-summary-bill-amount">{formatCurrency(bill.total_amount)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : <p className="student-summary-empty">Bạn hiện không có hóa đơn chưa thanh toán.</p>}
              </section>
            </>
          )}
    </>
  );
}
