import { useEffect, useState } from 'react';
import { meterReadingApi } from '../../api/meterReading.api';
import { formatDate } from './studentPageUtils';
import './MeterReadingForm.css';

export default function MeterReadingForm({ current, onSubmitted }) {
  const [electricPhoto, setElectricPhoto] = useState(null);
  const [waterPhoto, setWaterPhoto] = useState(null);
  const [electricPreview, setElectricPreview] = useState('');
  const [waterPreview, setWaterPreview] = useState('');
  const [readings, setReadings] = useState({ electricReading: '', waterReading: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!electricPhoto) {
      setElectricPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(electricPhoto);
    setElectricPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [electricPhoto]);

  useEffect(() => {
    if (!waterPhoto) {
      setWaterPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(waterPhoto);
    setWaterPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [waterPhoto]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await meterReadingApi.submit(electricPhoto, waterPhoto, readings);
      await onSubmitted();
    } catch (requestError) {
      setError(requestError.message || 'Không thể gửi chỉ số điện nước.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="meter-reading-form" onSubmit={submit}>
      <div className="meter-reading-photo-grid">
        <label className="meter-photo-input">
          <strong>Ảnh minh chứng công tơ điện</strong>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
            setElectricPhoto(event.target.files?.[0] || null);
            setReadings({ electricReading: '', waterReading: '' });
          }} required />
          {electricPreview && <img src={electricPreview} alt="Xem trước công tơ điện" />}
        </label>
        <label className="meter-photo-input">
          <strong>Ảnh minh chứng công tơ nước</strong>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
            setWaterPhoto(event.target.files?.[0] || null);
            setReadings({ electricReading: '', waterReading: '' });
          }} required />
          {waterPreview && <img src={waterPreview} alt="Xem trước công tơ nước" />}
        </label>
      </div>
      {electricPhoto && waterPhoto && (
        <div className="form-grid meter-reading-values">
          <label>Tự nhập chỉ số điện (kWh)<input type="number" min="0" step="1" value={readings.electricReading} onChange={(event) => setReadings((currentReadings) => ({ ...currentReadings, electricReading: event.target.value }))} required /></label>
          <label>Tự nhập chỉ số nước (m³)<input type="number" min="0" step="1" value={readings.waterReading} onChange={(event) => setReadings((currentReadings) => ({ ...currentReadings, waterReading: event.target.value }))} required /></label>
          <p className="form-hint form-wide">Hai ảnh chỉ dùng làm minh chứng để quản lý kiểm tra; hãy tự nhập chỉ số đọc được. Ảnh được lưu riêng tư trên máy chủ ký túc xá.</p>
        </div>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
      {electricPhoto && waterPhoto && (
        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi chỉ số cho quản lý xác nhận'}
        </button>
      )}
      <p className="form-hint">Hạn gửi chỉ số kỳ {current.month}/{current.year}: {formatDate(current.deadline)}.</p>
    </form>
  );
}
