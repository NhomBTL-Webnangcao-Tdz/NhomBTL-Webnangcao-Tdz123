import { useEffect, useState } from 'react';
import { meterReadingApi } from '../../api/meterReading.api';
import { ErrorState, LoadingState } from '../../components/common/AsyncState';
import InvoiceReceiptLink from '../../components/common/InvoiceReceiptLink';
import PageHeading from '../../components/common/PageHeading';
import MeterReadingForm from './MeterReadingForm';
import { formatDate, getBillStatus } from './studentPageUtils';
import './BillsPage.css';

export default function BillsPage({ portal, loading, error, retry }) {
  const [reading, setReading] = useState(null);
  const [readingLoading, setReadingLoading] = useState(true);
  const [readingError, setReadingError] = useState('');

  const refreshReading = () => {
    setReadingLoading(true);
    setReadingError('');
    return meterReadingApi.current()
      .then(setReading)
      .catch((requestError) => setReadingError(requestError.message || 'Không thể tải kỳ ghi chỉ số.'))
      .finally(() => setReadingLoading(false));
  };

  useEffect(() => {
    refreshReading();
  }, []);

  return (
    <>
      <PageHeading eyebrow="CỔNG SINH VIÊN" title="Hóa đơn của tôi" description="Xem ngay hóa đơn mới được quản lý xác nhận và các khoản chưa thanh toán." />
      {loading ? <section className="panel"><LoadingState message="Đang tải hóa đơn cá nhân..." /></section>
        : error ? <section className="panel"><ErrorState message={error} onRetry={retry} /></section>
          : !portal?.linked ? (
            <section className="panel student-empty-panel">
              <h3>Hoàn thiện hồ sơ cá nhân</h3>
              <p>Hãy lưu hồ sơ của bạn để xem các hóa đơn lưu trú.</p>
              <a className="button button-primary" href="#my-profile">Đến hồ sơ cá nhân</a>
            </section>
          ) : (
            <>
              <section className="panel student-bills-panel">
                <div className="student-panel-heading"><div><h3>Hóa đơn cần thanh toán</h3><p>Hóa đơn mới được xác nhận sẽ hiển thị ngay tại đây cùng các khoản chưa thanh toán.</p></div></div>
                <div className="table-scroll">
                  <table className="records-table student-bills-table">
                    <thead><tr><th>Mã hóa đơn</th><th>Khoản thu</th><th>Kỳ</th><th>Tiền phòng</th><th>Điện nước</th><th>Tổng phần của bạn</th><th>Hạn thanh toán</th><th>Ảnh hóa đơn</th><th>Trạng thái</th></tr></thead>
                    <tbody>{portal.bills?.length ? portal.bills.map((bill) => (
                      <tr key={bill.bill_id}>
                        <td>HD-{String(bill.bill_id).padStart(4, '0')}</td>
                        <td>{bill.billType === 'GENERAL' ? bill.title : 'Tiền phòng + điện nước'}{bill.description && <small className="bill-description">{bill.description}</small>}</td>
                        <td>{String(bill.month).padStart(2, '0')}/{bill.year}</td>
                        <td>{Number(bill.roomRentAmount || 0).toLocaleString('vi-VN')} ₫</td>
                        <td>{Math.max(0, Number(bill.total_amount) - Number(bill.roomRentAmount || 0)).toLocaleString('vi-VN')} ₫</td>
                        <td>{Number(bill.total_amount).toLocaleString('vi-VN')} ₫</td>
                        <td>{formatDate(bill.dueDate)}</td>
                        <td>{bill.hasReceiptImage ? <InvoiceReceiptLink billId={bill.bill_id} /> : '—'}</td>
                        <td><span className={`status-badge ${getBillStatus(bill.dueDate) === 'Quá hạn' ? 'status-red' : 'status-yellow'}`}>{getBillStatus(bill.dueDate)}</span></td>
                      </tr>
                    )) : <tr><td colSpan="9" className="student-table-empty">Chưa có hóa đơn sắp đến hạn.</td></tr>}</tbody>
                  </table>
                </div>
              </section>
              <section className="panel meter-reading-panel">
                <div className="student-panel-heading">
                  <div><h3>Gửi chỉ số điện nước</h3><p>Chỉ cần một sinh viên trong phòng gửi ảnh mỗi kỳ.</p></div>
                </div>
                {readingLoading ? <LoadingState message="Đang kiểm tra kỳ gửi chỉ số..." />
                  : readingError ? <ErrorState message={readingError} onRetry={refreshReading} />
                    : !reading?.room ? <p className="async-state">Bạn chưa có phòng lưu trú đang hiệu lực.</p>
                      : reading.submission?.status === 'PENDING' ? (
                        <div className="inline-notice">Phòng {reading.room.roomNumber}, tòa {reading.room.building}: chỉ số {reading.month}/{reading.year} đang chờ quản lý xác nhận.</div>
                      ) : reading.submission?.status === 'APPROVED' ? (
                        <div className="inline-notice">Chỉ số kỳ {reading.month}/{reading.year} đã được duyệt. Hóa đơn đến hạn ngày 10 tháng kế tiếp.</div>
                      ) : (
                        <>
                          {reading.submission?.status === 'REJECTED' && <p className="form-error" role="alert">Yêu cầu gửi lại: {reading.submission.reviewNote || 'Ảnh hoặc chỉ số cần được kiểm tra lại.'}</p>}
                          {reading.canSubmit
                            ? <MeterReadingForm key={`${reading.month}-${reading.year}-${reading.submission?.id || 'new'}`} current={reading} onSubmitted={refreshReading} />
                            : <p className="async-state">Đã hết hạn gửi chỉ số cho kỳ này.</p>}
                        </>
                      )}
              </section>
            </>
          )}
    </>
  );
}
