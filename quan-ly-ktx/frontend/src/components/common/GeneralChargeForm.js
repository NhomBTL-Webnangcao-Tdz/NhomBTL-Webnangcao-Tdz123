import { useState } from 'react';
import RoomPicker from './RoomPicker';

function getDefaultDueDate() {
  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + 1, 10);
  return [
    dueDate.getFullYear(),
    String(dueDate.getMonth() + 1).padStart(2, '0'),
    String(dueDate.getDate()).padStart(2, '0'),
  ].join('-');
}

export default function GeneralChargeForm({ rooms = [], onSave, onCancel, saving, error }) {
  const now = new Date();
  const [charge, setCharge] = useState({
    title: '',
    description: '',
    roomId: '',
    totalAmount: '',
    dueDate: getDefaultDueDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    receiptImage: null,
  });

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;
    setCharge((current) => ({
      ...current,
      [name]: type === 'file' ? files?.[0] || null : value,
    }));
  };

  return (
    <form className="form-grid" onSubmit={(event) => {
      event.preventDefault();
      onSave(charge);
    }}>
      <label className="form-wide">Khoản cần thanh toán<input name="title" value={charge.title} onChange={handleChange} placeholder="Ví dụ: Sửa điều hòa phòng 302" maxLength="120" required /></label>
      <label className="form-wide">Ghi chú<textarea name="description" value={charge.description} onChange={handleChange} rows="2" maxLength="500" placeholder="Thông tin bổ sung cho khoản thu (không bắt buộc)" /></label>
      <RoomPicker rooms={rooms} selectedRoomId={charge.roomId} onSelect={(room) => {
        setCharge((current) => ({ ...current, roomId: room?.id || '' }));
      }} />
      <label className="form-wide">Tổng số tiền (₫)<input name="totalAmount" type="number" min="0" step="0.01" value={charge.totalAmount} onChange={handleChange} required /></label>
      <label>Hạn thanh toán<input name="dueDate" type="date" value={charge.dueDate} onChange={handleChange} required /></label>
      <label>Ảnh hóa đơn (không bắt buộc)<input name="receiptImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} /></label>
      {charge.receiptImage && <p className="form-hint form-wide">Đã chọn: {charge.receiptImage.name}</p>}
      <p className="form-hint form-wide">Khoản thu sẽ được chia đều cho sinh viên đang lưu trú tại phòng đã chọn và gửi thông báo cho từng người. Ảnh hóa đơn chỉ dùng làm minh chứng.</p>
      {error && <p className="form-error form-wide" role="alert">{error}</p>}
      <div className="form-actions form-wide">
        <button type="button" className="button button-secondary" onClick={onCancel}>Hủy</button>
        <button type="submit" className="button button-primary" disabled={saving || !charge.roomId}>{saving ? 'Đang tạo...' : 'Tạo hóa đơn'}</button>
      </div>
    </form>
  );
}
