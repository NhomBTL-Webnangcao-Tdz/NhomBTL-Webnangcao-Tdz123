import { useState } from 'react';
import { ErrorState, LoadingState } from '../../components/common/AsyncState';
import PageHeading from '../../components/common/PageHeading';
import './RoomPage.css';

export default function RoomPage({ portal, loading, error, retry, onRequest }) {
  const [note, setNote] = useState('');
  const [requestError, setRequestError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const status = portal?.residenceRequest?.status;

  const submitRequest = async () => {
    setRequestError('');
    setSubmitting(true);
    try {
      await onRequest({ note });
      setNote('');
    } catch (requestProblem) {
      setRequestError(requestProblem.message || 'Không thể gửi yêu cầu lưu trú.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeading eyebrow="CỔNG SINH VIÊN" title="Phòng của tôi" description="Gửi đăng ký lưu trú và theo dõi kết quả xếp phòng." />
      {loading ? <section className="panel"><LoadingState message="Đang tải thông tin lưu trú..." /></section>
        : error ? <section className="panel"><ErrorState message={error} onRetry={retry} /></section>
          : !portal?.linked ? (
            <section className="panel student-empty-panel">
              <span className="student-empty-icon" aria-hidden="true">♙</span>
              <h3>Hoàn thiện hồ sơ trước khi đăng ký lưu trú</h3>
              <p>Điền thông tin tại mục Hồ sơ cá nhân để gửi yêu cầu đăng ký ở ký túc xá.</p>
              <a className="button button-primary" href="#my-profile">Hoàn thiện hồ sơ cá nhân</a>
            </section>
          ) : portal.room ? (
            <section className="student-room-layout">
              <article className="panel student-room-card">
                <p className="eyebrow">PHÒNG ĐANG Ở</p>
                <strong className="student-room-number">{portal.room.roomNumber}</strong>
                <span className="student-room-building">{portal.room.building}</span>
              </article>
              <section className="panel student-roommates">
                <div className="student-panel-heading"><h3>Các bạn cùng phòng</h3><p>Thông tin liên hệ để tiện sinh hoạt chung</p></div>
                {portal.roommates?.length ? (
                  <ul>{portal.roommates.map((roommate) => (
                    <li key={roommate.sid}>
                      <span className="identity-avatar">{roommate.name?.slice(0, 1)?.toUpperCase() || 'S'}</span>
                      <span><strong>{roommate.name}</strong><small>{roommate.sid}</small></span>
                      <a href={`tel:${roommate.phone}`}>{roommate.phone}</a>
                    </li>
                  ))}</ul>
                ) : <p className="async-state">Hiện chưa có bạn cùng phòng được ghi nhận.</p>}
              </section>
            </section>
          ) : (
            <section className="panel student-empty-panel">
              <span className="student-empty-icon" aria-hidden="true">⌂</span>
              <h3>{status === 'PENDING' ? 'Yêu cầu lưu trú đang chờ quản lý duyệt' : status === 'REJECTED' ? 'Yêu cầu lưu trú chưa được chấp nhận' : 'Bạn chưa được xếp phòng'}</h3>
              <p>{status === 'PENDING'
                ? `Đã gửi ngày ${new Date(portal.residenceRequest.requestedAt).toLocaleDateString('vi-VN')}. Hệ thống sẽ thông báo khi quản lý xử lý yêu cầu.`
                : status === 'REJECTED'
                  ? portal.residenceRequest.reviewNote || 'Bạn có thể gửi lại yêu cầu hoặc liên hệ ban quản lý.'
                  : 'Gửi yêu cầu đăng ký lưu trú. Quản lý sẽ duyệt và xếp phòng cho bạn.'}</p>
              {status !== 'PENDING' && (
                <div className="residence-request-form">
                  <label>Ghi chú cho quản lý (không bắt buộc)<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} rows={3} /></label>
                  {requestError && <p className="form-error" role="alert">{requestError}</p>}
                  <button className="button button-primary" onClick={submitRequest} disabled={submitting}>{submitting ? 'Đang gửi...' : status === 'REJECTED' ? 'Gửi lại yêu cầu lưu trú' : 'Đăng ký lưu trú'}</button>
                </div>
              )}
            </section>
          )}
    </>
  );
}
