import { useEffect, useMemo, useState } from 'react';
import { meterReadingApi } from '../../api/meterReading.api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import useApiResource from '../../hooks/useApiResource';

const statusLabels = { PENDING: 'Chờ xác nhận', APPROVED: 'Đã duyệt', REJECTED: 'Cần gửi lại' };

function ReadingReviewDialog({ submission, onClose, onReviewed }) {
  const [electricReading, setElectricReading] = useState(submission.electricReading);
  const [waterReading, setWaterReading] = useState(submission.waterReading);
  const [reviewNote, setReviewNote] = useState('');
  const [photos, setPhotos] = useState({ electric: '', water: '' });
  const [photoError, setPhotoError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    let urls = [];
    Promise.all([
      meterReadingApi.getPhoto(submission.id, 'electric'),
      meterReadingApi.getPhoto(submission.id, 'water'),
    ]).then(([electric, water]) => {
      urls = [electric, water];
      if (active) setPhotos({ electric, water });
      else urls.forEach((url) => URL.revokeObjectURL(url));
    }).catch((error) => {
      if (active) setPhotoError(error.message || 'Không thể tải ảnh công tơ.');
    });
    return () => {
      active = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [submission.id]);

  const review = async (status) => {
    setSaving(true);
    setSaveError('');
    try {
      await onReviewed(submission.id, {
        status,
        electricReading: Number(electricReading),
        waterReading: Number(waterReading),
        reviewNote,
      });
    } catch (error) {
      setSaveError(error.message || 'Không thể cập nhật bản gửi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="meter-review-dialog">
      <p className="form-hint">Tòa {submission.room?.building} · Phòng {submission.room?.roomNumber} · Kỳ {submission.month}/{submission.year}</p>
      {photoError && <p className="form-error" role="alert">{photoError}</p>}
      <div className="meter-review-photos">
        <figure><figcaption>Ảnh minh chứng công tơ điện</figcaption>{photos.electric ? <img src={photos.electric} alt="Ảnh minh chứng công tơ điện do sinh viên gửi" /> : <p className="async-state">Đang tải ảnh...</p>}</figure>
        <figure><figcaption>Ảnh minh chứng công tơ nước</figcaption>{photos.water ? <img src={photos.water} alt="Ảnh minh chứng công tơ nước do sinh viên gửi" /> : <p className="async-state">Đang tải ảnh...</p>}</figure>
      </div>
      <div className="form-grid">
        <label>Chỉ số điện (kWh)<input type="number" min="0" value={electricReading} onChange={(event) => setElectricReading(event.target.value)} /></label>
        <label>Chỉ số nước (m³)<input type="number" min="0" value={waterReading} onChange={(event) => setWaterReading(event.target.value)} /></label>
        <label className="form-wide">Ghi chú cho sinh viên<textarea rows="2" maxLength="500" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} /></label>
        {saveError && <p className="form-error form-wide" role="alert">{saveError}</p>}
        <div className="form-actions form-wide">
          <button type="button" className="button button-secondary" onClick={onClose}>Đóng</button>
          <button type="button" className="button button-secondary" disabled={saving} onClick={() => review('REJECTED')}>Yêu cầu gửi lại</button>
          <button type="button" className="button button-primary" disabled={saving || photoError || !photos.electric || !photos.water} onClick={() => review('APPROVED')}>
            {saving ? 'Đang lưu...' : 'Xác nhận và tạo hóa đơn'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UtilityTariffForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [electricPrice, setElectricPrice] = useState('');
  const [waterPrice, setWaterPrice] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const refresh = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    meterReadingApi.tariff()
      .then((result) => {
        if (active) {
          setElectricPrice(result.electricPrice ?? '');
          setWaterPrice(result.waterPrice ?? '');
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Không thể tải đơn giá điện nước.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [reloadKey]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveMessage('');
    try {
      await meterReadingApi.updateTariff({
        electricPrice: Number(electricPrice),
        waterPrice: Number(waterPrice),
      });
      setSaveMessage('Đã lưu đơn giá. Các hóa đơn đã xác nhận giữ nguyên mức giá cũ.');
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message || 'Không thể lưu đơn giá.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel utility-tariff-panel">
      <div className="student-panel-heading"><div><h3>Đơn giá điện nước</h3><p>Giá áp dụng cho các hóa đơn được xác nhận từ bây giờ trở đi.</p></div></div>
      {error && <div className="inline-notice" role="alert">{error}<button className="text-button" onClick={refresh}>Thử lại</button></div>}
      <form className="form-grid utility-tariff-form" onSubmit={save}>
        <label>Giá điện (đ/kWh)<input type="number" min="0" step="0.01" value={electricPrice} onChange={(event) => setElectricPrice(event.target.value)} required disabled={isLoading} /></label>
        <label>Giá nước (đ/m³)<input type="number" min="0" step="0.01" value={waterPrice} onChange={(event) => setWaterPrice(event.target.value)} required disabled={isLoading} /></label>
        <div className="form-actions form-wide">
          {saveMessage && <span className="form-success" role="status">{saveMessage}</span>}
          {saveError && <span className="form-error" role="alert">{saveError}</span>}
          <button className="button button-primary" type="submit" disabled={saving || isLoading}>{saving ? 'Đang lưu...' : 'Lưu đơn giá'}</button>
        </div>
      </form>
    </section>
  );
}

export default function MeterReadingsPanel() {
  const { data: submissions, isLoading, error, refresh } = useApiResource(meterReadingApi.list);
  const [filter, setFilter] = useState('PENDING');
  const [selected, setSelected] = useState(null);
  const filteredSubmissions = useMemo(() => filter === 'ALL'
    ? submissions
    : submissions.filter((submission) => submission.status === filter), [filter, submissions]);

  const review = async (id, details) => {
    await meterReadingApi.review(id, details);
    setSelected(null);
    refresh();
  };

  const columns = [
    { key: 'room', label: 'Phòng', render: (submission) => `Tòa ${submission.room?.building} · ${submission.room?.roomNumber}` },
    { key: 'period', label: 'Kỳ', render: (submission) => `${String(submission.month).padStart(2, '0')}/${submission.year}` },
    { key: 'readings', label: 'Chỉ số sinh viên tự khai báo', render: (submission) => `Điện ${submission.electricReading} · Nước ${submission.waterReading}` },
    { key: 'createdAt', label: 'Ngày gửi', render: (submission) => new Date(submission.createdAt).toLocaleString('vi-VN') },
    { key: 'status', label: 'Trạng thái', render: (submission) => <StatusBadge value={submission.status === 'APPROVED' ? 'paid' : submission.status === 'REJECTED' ? 'overdue' : 'upcoming'} label={statusLabels[submission.status]} /> },
    { key: 'actions', label: '', render: (submission) => <button className="text-button" onClick={() => setSelected(submission)}>Xem ảnh / xác nhận</button> },
  ];

  return (
    <>
      <UtilityTariffForm />
      <section className="panel meter-review-panel">
        <div className="student-panel-heading"><div><h3>Ảnh và chỉ số chờ xác nhận</h3><p>Kiểm tra ảnh, sửa số đọc nếu cần; xác nhận sẽ tự tạo hóa đơn kỳ này.</p></div></div>
        <div className="table-toolbar">
          <label className="compact-select">Trạng thái<select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="PENDING">Chờ xác nhận</option><option value="APPROVED">Đã duyệt</option><option value="REJECTED">Cần gửi lại</option><option value="ALL">Tất cả</option>
          </select></label>
          <span className="toolbar-count">{submissions.filter((submission) => submission.status === 'PENDING').length} bản gửi chờ xác nhận</span>
        </div>
        <DataTable columns={columns} rows={filteredSubmissions} rowKey={(submission) => submission.id} isLoading={isLoading} error={error} onRetry={refresh} emptyMessage="Chưa có bản gửi chỉ số." />
      </section>
      {selected && <Modal title="Xác nhận chỉ số điện nước" onClose={() => setSelected(null)} wide>
        <ReadingReviewDialog key={selected.id} submission={selected} onClose={() => setSelected(null)} onReviewed={review} />
      </Modal>}
    </>
  );
}
