import { useState } from 'react';
import RoomPicker from './RoomPicker';

const initialBill = {
  roomId: '',
  dueDate: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  old_electric_index: 0,
  new_electric_index: 0,
  old_water_index: 0,
  new_water_index: 0,
  total_amount: 0,
  is_paid: false,
};

export default function BillForm({ value, rooms = [], onSave, onCancel, saving, error }) {
  const [bill, setBill] = useState({
    ...initialBill,
    ...value,
    roomId: value?.room?.id || value?.roomId || '',
    dueDate: value?.dueDate ? String(value.dueDate).slice(0, 10) : '',
  });
  const handleChange = (event) => {
    const { name, value: fieldValue, type, checked } = event.target;
    setBill((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(fieldValue) : fieldValue,
    }));
  };
  const electricUsage = Math.max(0, Number(bill.new_electric_index) - Number(bill.old_electric_index));
  const waterUsage = Math.max(0, Number(bill.new_water_index) - Number(bill.old_water_index));
  const invalidReading = Number(bill.new_electric_index) < Number(bill.old_electric_index)
    || Number(bill.new_water_index) < Number(bill.old_water_index);

  return (
    <form className="form-grid" onSubmit={(event) => {
      event.preventDefault();
      onSave({
        room: bill.roomId ? { id: bill.roomId } : null,
        dueDate: bill.dueDate || null,
        month: Number(bill.month),
        year: Number(bill.year),
        old_electric_index: Number(bill.old_electric_index),
        new_electric_index: Number(bill.new_electric_index),
        old_water_index: Number(bill.old_water_index),
        new_water_index: Number(bill.new_water_index),
        total_amount: Number(bill.total_amount),
        is_paid: Boolean(bill.is_paid),
      });
    }}>
      <RoomPicker rooms={rooms} selectedRoomId={bill.roomId} onSelect={(room) => {
        setBill((current) => ({ ...current, roomId: room?.id || '' }));
      }} />
      <label className="form-wide">Hạn thanh toán<input name="dueDate" type="date" value={bill.dueDate} onChange={handleChange} required /></label>
      <label>Tháng<input name="month" type="number" min="1" max="12" value={bill.month} onChange={handleChange} required /></label>
      <label>Năm<input name="year" type="number" min="2000" value={bill.year} onChange={handleChange} required /></label>
      <label>Điện cũ (kWh)<input name="old_electric_index" type="number" min="0" value={bill.old_electric_index} onChange={handleChange} required /></label>
      <label>Điện mới (kWh)<input name="new_electric_index" type="number" min="0" value={bill.new_electric_index} onChange={handleChange} required /></label>
      <label>Nước cũ (m³)<input name="old_water_index" type="number" min="0" value={bill.old_water_index} onChange={handleChange} required /></label>
      <label>Nước mới (m³)<input name="new_water_index" type="number" min="0" value={bill.new_water_index} onChange={handleChange} required /></label>
      <div className="usage-summary form-wide">
        <span>Điện tiêu thụ <strong>{electricUsage} kWh</strong></span>
        <span>Nước tiêu thụ <strong>{waterUsage} m³</strong></span>
      </div>
      {invalidReading && <p className="form-error form-wide" role="alert">Chỉ số mới không được nhỏ hơn chỉ số cũ.</p>}
      <label className="form-wide">Tổng tiền (₫)<input name="total_amount" type="number" min="0" value={bill.total_amount} onChange={handleChange} required /></label>
      <label className="checkbox-field form-wide"><input name="is_paid" type="checkbox" checked={bill.is_paid} onChange={handleChange} /> Đã thanh toán</label>
      <p className="form-hint form-wide">Hóa đơn được gắn với phòng để sinh viên lưu trú có thể xem khoản cần thanh toán.</p>
      {error && <p className="form-error form-wide" role="alert">{error}</p>}
      <div className="form-actions form-wide">
        <button type="button" className="button button-secondary" onClick={onCancel}>Hủy</button>
        <button type="submit" className="button button-primary" disabled={saving || invalidReading}>{saving ? 'Đang lưu...' : 'Lưu hóa đơn'}</button>
      </div>
    </form>
  );
}
