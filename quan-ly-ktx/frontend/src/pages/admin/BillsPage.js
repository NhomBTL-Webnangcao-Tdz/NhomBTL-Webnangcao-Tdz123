import { useMemo, useState } from 'react';
import { billApi } from '../../api/bill.api';
import { roomApi } from '../../api/room.api';
import BillForm from '../../components/common/BillForm';
import DataTable from '../../components/common/DataTable';
import GeneralChargeForm from '../../components/common/GeneralChargeForm';
import InvoiceReceiptLink from '../../components/common/InvoiceReceiptLink';
import Modal from '../../components/common/Modal';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import useApiResource from '../../hooks/useApiResource';
import './BillsPage.css';
import './Stats.css';

function isPastDue(dueDate) {
  if (!dueDate) return false;
  const due = new Date(`${String(dueDate).slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export default function BillsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { data: bills, isLoading, error, refresh } = useApiResource(billApi.list);
  const { data: rooms } = useApiResource(roomApi.list);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeBill, setActiveBill] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [generalChargeOpen, setGeneralChargeOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [generalChargeError, setGeneralChargeError] = useState('');
  const [generalChargeSaving, setGeneralChargeSaving] = useState(false);
  const [shareActionError, setShareActionError] = useState('');
  const [shareActionMessage, setShareActionMessage] = useState('');
  const [activeShareAction, setActiveShareAction] = useState('');
  const filtered = useMemo(() => bills.filter((bill) => {
    const matches = `HD-${bill.bill_id} ${bill.month}/${bill.year} ${bill.title || ''} ${bill.description || ''}`
      .toLowerCase().includes(search.trim().toLowerCase());
    return matches && (statusFilter === 'all' || (statusFilter === 'paid' ? bill.is_paid : !bill.is_paid));
  }), [bills, search, statusFilter]);

  const closeForm = () => { setFormOpen(false); setActiveBill(null); setSaveError(''); };
  const saveBill = async (bill) => {
    setSaving(true);
    setSaveError('');
    try {
      if (activeBill) await billApi.update(activeBill.bill_id, bill);
      else await billApi.create(bill);
      closeForm();
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  };
  const createGeneralCharge = async (charge) => {
    setGeneralChargeSaving(true);
    setGeneralChargeError('');
    try {
      await billApi.createGeneralCharge(charge);
      setGeneralChargeOpen(false);
      refresh();
    } catch (requestError) {
      setGeneralChargeError(requestError.message);
    } finally {
      setGeneralChargeSaving(false);
    }
  };
  const removeBill = async (bill) => {
    if (!window.confirm(`Xóa hóa đơn #${bill.bill_id}?`)) return;
    try {
      await billApi.remove(bill.bill_id);
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
      setActiveBill(bill);
      setFormOpen(true);
    }
  };

  const updateSharePayment = async (bill, share) => {
    const actionKey = `${bill.bill_id}:${share.student.sid}`;
    setActiveShareAction(actionKey);
    setShareActionError('');
    setShareActionMessage('');
    try {
      await billApi.updateSharePayment(bill.bill_id, share.student.sid, !share.isPaid);
      setShareActionMessage(`Đã cập nhật trạng thái thanh toán của ${share.student.sname}.`);
      refresh();
    } catch (requestError) {
      setShareActionError(requestError.message);
    } finally {
      setActiveShareAction('');
    }
  };

  const remindStudent = async (bill, share) => {
    const actionKey = `${bill.bill_id}:${share.student.sid}`;
    setActiveShareAction(actionKey);
    setShareActionError('');
    setShareActionMessage('');
    try {
      await billApi.remindStudent(bill.bill_id, share.student.sid);
      setShareActionMessage(`Đã gửi thông báo nhắc thanh toán tới ${share.student.sname}.`);
      refresh();
    } catch (requestError) {
      setShareActionError(requestError.message);
    } finally {
      setActiveShareAction('');
    }
  };

  const columns = [
    { key: 'bill_id', label: 'Mã hóa đơn', render: (bill) => `HD-${String(bill.bill_id).padStart(4, '0')}` },
    { key: 'room', label: 'Phòng', render: (bill) => bill.room ? `${bill.room.building} · ${bill.room.roomNumber}` : 'Chưa gắn phòng' },
    { key: 'title', label: 'Khoản thu', render: (bill) => <><strong>{bill.billType === 'GENERAL' ? bill.title : 'Tiền phòng + điện nước'}</strong>{bill.description && <small className="bill-description">{bill.description}</small>}</> },
    { key: 'period', label: 'Kỳ', render: (bill) => `${String(bill.month).padStart(2, '0')}/${bill.year}` },
    { key: 'dueDate', label: 'Hạn thanh toán', render: (bill) => bill.dueDate ? String(bill.dueDate).slice(0, 10).split('-').reverse().join('/') : '—' },
    { key: 'roomRent', label: 'Tiền phòng', render: (bill) => Number(bill.roomRentAmount || 0).toLocaleString('vi-VN') + ' ₫' },
    { key: 'utilities', label: 'Điện nước', render: (bill) => bill.billType === 'GENERAL' ? '—' : `${Math.max(0, Number(bill.total_amount) - Number(bill.roomRentAmount || 0)).toLocaleString('vi-VN')} ₫` },
    { key: 'electric', label: 'Điện tiêu thụ', render: (bill) => bill.billType === 'GENERAL' ? '—' : `${Math.max(0, bill.new_electric_index - bill.old_electric_index)} kWh` },
    { key: 'water', label: 'Nước tiêu thụ', render: (bill) => bill.billType === 'GENERAL' ? '—' : `${Math.max(0, bill.new_water_index - bill.old_water_index)} m³` },
    { key: 'total_amount', label: 'Tổng tiền', render: (bill) => `${Number(bill.total_amount).toLocaleString('vi-VN')} ₫` },
    { key: 'is_paid', label: 'Trạng thái', render: (bill) => <StatusBadge value={bill.is_paid ? 'paid' : 'unpaid'} label={bill.is_paid ? 'Đã thanh toán' : 'Chưa thanh toán'} /> },
    { key: 'receipt', label: 'Ảnh hóa đơn', render: (bill) => bill.hasReceiptImage ? <InvoiceReceiptLink billId={bill.bill_id} /> : '—' },
    {
      key: 'shares',
      label: 'Phần từng sinh viên',
      render: (bill) => bill.shares?.length ? (
        <ul className="bill-share-list">
          {bill.shares.map((share) => {
            const overdue = !share.isPaid && isPastDue(bill.dueDate);
            const actionKey = `${bill.bill_id}:${share.student.sid}`;
            return (
              <li key={share.student.sid}>
                <strong>{share.student.sname}</strong>
                <small>{share.student.sid} · Tiền phòng {Number(share.roomRentAmount || 0).toLocaleString('vi-VN')} ₫ · Điện nước {Math.max(0, Number(share.amount) - Number(share.roomRentAmount || 0)).toLocaleString('vi-VN')} ₫ · Tổng {Number(share.amount).toLocaleString('vi-VN')} ₫</small>
                <StatusBadge
                  value={share.isPaid ? 'paid' : overdue ? 'overdue' : 'unpaid'}
                  label={share.isPaid ? 'Đã thanh toán' : overdue ? 'Quá hạn' : 'Chưa thanh toán'}
                />
                <div className="row-actions">
                  {share.student.phone && <a className="text-button" href={`tel:${share.student.phone}`}>Gọi</a>}
                  {share.student.email && <a className="text-button" href={`mailto:${share.student.email}`}>Email</a>}
                  {overdue && (
                    <button
                      className="text-button"
                      disabled={activeShareAction === actionKey}
                      onClick={() => remindStudent(bill, share)}
                    >
                      {activeShareAction === actionKey ? 'Đang gửi...' : 'Gửi nhắc'}
                    </button>
                  )}
                  {!share.isPaid && (
                    <button
                      className="text-button"
                      disabled={activeShareAction === actionKey}
                      onClick={() => updateSharePayment(bill, share)}
                    >
                      Đánh dấu đã thu
                    </button>
                  )}
                  {share.isPaid && (
                    <button
                      className="text-button"
                      disabled={activeShareAction === actionKey}
                      onClick={() => updateSharePayment(bill, share)}
                    >
                      Hoàn tác
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : 'Chưa có dữ liệu chia hóa đơn.',
    },
    { key: 'actions', label: '', render: (bill) => <div className="row-actions">{bill.billType !== 'GENERAL' && <button className="text-button" onClick={() => { setActiveBill(bill); setFormOpen(true); }}>Sửa</button>}{isAdmin && <button className="text-button danger-text" onClick={() => removeBill(bill)}>Xóa</button>}</div> },
  ];

  return (
    <>
      <PageHeading eyebrow="THU CHI & CÔNG NỢ" title="Hóa đơn & Khoản thu" description="Theo dõi hóa đơn điện nước và các khoản phí phát sinh theo phòng." action={<button className="button button-primary" onClick={() => { setGeneralChargeError(''); setGeneralChargeOpen(true); }}>＋ Tạo hóa đơn</button>} />
      <div className="stat-grid compact-stats">
        <article className="stat-card"><span className="stat-label">Tổng hóa đơn</span><strong>{bills.length}</strong></article>
        <article className="stat-card"><span className="stat-label">Đã thanh toán</span><strong>{bills.filter((bill) => bill.is_paid).length}</strong></article>
        <article className="stat-card"><span className="stat-label">Chưa thanh toán</span><strong>{bills.filter((bill) => !bill.is_paid).length}</strong></article>
        <article className="stat-card"><span className="stat-label">Tổng giá trị hóa đơn</span><strong>{bills.reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0).toLocaleString('vi-VN')} ₫</strong></article>
      </div>
      <section className="panel">
        {shareActionMessage && <p className="form-success" role="status">{shareActionMessage}</p>}
        {shareActionError && <p className="form-error" role="alert">{shareActionError}</p>}
        <div className="table-toolbar">
          <label className="search-field"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã hóa đơn hoặc kỳ thanh toán" aria-label="Tìm hóa đơn" /></label>
          <label className="compact-select">Thanh toán<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Tất cả</option><option value="unpaid">Chưa thanh toán</option><option value="paid">Đã thanh toán</option></select></label>
        </div>
        <DataTable columns={columns} rows={filtered} rowKey={(bill) => bill.bill_id} isLoading={isLoading} error={error} onRetry={refresh} emptyMessage="Không tìm thấy hóa đơn." />
      </section>
      {formOpen && <Modal title={`Hóa đơn điện nước #${activeBill.bill_id}`} onClose={closeForm} wide><BillForm value={activeBill} rooms={rooms} onSave={saveBill} onCancel={closeForm} saving={saving} error={saveError} /></Modal>}
      {generalChargeOpen && <Modal title="Tạo hóa đơn khoản thu" onClose={() => setGeneralChargeOpen(false)} wide><GeneralChargeForm rooms={rooms} onSave={createGeneralCharge} onCancel={() => setGeneralChargeOpen(false)} saving={generalChargeSaving} error={generalChargeError} /></Modal>}
    </>
  );
}
