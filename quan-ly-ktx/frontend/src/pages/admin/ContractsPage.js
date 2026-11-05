import { useEffect, useMemo, useState } from 'react';
import { contractApi } from '../../api/contract.api';
import { paymentApi } from '../../api/payment.api';
import { roomApi } from '../../api/room.api';
import { studentApi } from '../../api/student.api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import PageHeading from '../../components/common/PageHeading';
import RoomPicker from '../../components/common/RoomPicker';
import StatusBadge from '../../components/common/StatusBadge';
import useApiResource from '../../hooks/useApiResource';
import './ContractsPage.css';

function getContractState(contract) {
  if (!contract.is_active) return 'terminated';
  const end = new Date(`${String(contract.end_date).slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.ceil((end - today) / 86400000);
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining <= 30) return 'upcoming';
  return 'active';
}

const stateLabels = { active: 'Hiệu lực', upcoming: 'Sắp hết hạn', overdue: 'Quá hạn', terminated: 'Đã thanh lý' };

function getLocalDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function PaymentDialog({ contract, onClose }) {
  const [payments, setPayments] = useState([]);
  const [paymentType, setPaymentType] = useState('Tiền phòng');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(getLocalDateTime);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    paymentApi.list(contract.contract_id)
      .then((result) => {
        if (active) setPayments(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [contract.contract_id, reloadKey]);

  const recordPayment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await paymentApi.create({
        contractId: contract.contract_id,
        amount: Number(amount),
        payment_date: new Date(paymentDate).toISOString(),
        payment_type: paymentType,
      });
      setAmount('');
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Ghi nhận thanh toán · HĐ-${String(contract.contract_id).padStart(4, '0')}`} onClose={onClose} wide>
      <form className="form-grid payment-form" onSubmit={recordPayment}>
        <label>Khoản thu
          <select value={paymentType} onChange={(event) => setPaymentType(event.target.value)}>
            <option>Tiền phòng</option>
            <option>Điện nước</option>
            <option>Sửa chữa</option>
            <option>Khoản thu khác</option>
          </select>
        </label>
        <label>Số tiền (₫)
          <input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        </label>
        <label className="form-wide">Thời điểm thanh toán
          <input type="datetime-local" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} required />
        </label>
        {error && <p className="form-error form-wide" role="alert">{error}</p>}
        <div className="form-actions form-wide">
          <button type="button" className="button button-secondary" onClick={onClose}>Đóng</button>
          <button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Ghi nhận thanh toán'}</button>
        </div>
      </form>
      <section className="payment-history">
        <h3>Lịch sử thanh toán</h3>
        {loading ? <p className="async-state">Đang tải giao dịch...</p> : payments.length ? (
          <div className="payment-history-list">
            {payments.map((payment) => (
              <div className="payment-history-row" key={payment.payment_id}>
                <span><strong>{payment.payment_type}</strong><small>{new Date(payment.payment_date).toLocaleString('vi-VN')}</small></span>
                <strong>{Number(payment.amount).toLocaleString('vi-VN')} ₫</strong>
              </div>
            ))}
          </div>
        ) : <p className="async-state">Chưa có thanh toán nào được ghi nhận.</p>}
      </section>
    </Modal>
  );
}

function ContractForm({ initialValue, students, rooms, onSave, onCancel, saving, error }) {
  const [step, setStep] = useState(1);
  const [contract, setContract] = useState({
    studentSid: initialValue?.student?.sid || '',
    roomId: initialValue?.room?.id || '',
    start_date: initialValue?.start_date?.slice(0, 10) || '',
    end_date: initialValue?.end_date?.slice(0, 10) || '',
    deposit_amount: initialValue?.deposit_amount || 0,
    is_active: initialValue?.is_active ?? true,
  });
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setContract((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSave({
      student: { sid: contract.studentSid },
      room: contract.roomId ? { id: contract.roomId } : null,
      start_date: contract.start_date,
      end_date: contract.end_date,
      deposit_amount: Number(contract.deposit_amount),
      is_active: Boolean(contract.is_active),
    });
  };

  return (
    <form className="wizard-form" onSubmit={submit}>
      <div className="wizard-steps"><span className={step === 1 ? 'current' : 'complete'}>1 <small>Sinh viên & phòng</small></span><i /><span className={step === 2 ? 'current' : ''}>2 <small>Thời hạn</small></span><i /><span className="preview-step">3 <small>Xác nhận</small></span></div>
      {step === 1 ? (
        <div className="form-grid">
          <label className="form-wide">Sinh viên<select name="studentSid" value={contract.studentSid} onChange={handleChange} required><option value="">Chọn sinh viên</option>{students.map((student) => <option key={student.sid} value={student.sid}>{student.sname} · {student.sid}</option>)}</select></label>
          <RoomPicker
            rooms={rooms}
            selectedRoomId={contract.roomId}
            availableOnly
            allowUnassigned
            onSelect={(room) => setContract((current) => ({ ...current, roomId: room?.id || '' }))}
          />
          <div className="api-limit-notice form-wide">Sinh viên sẽ thấy phòng, tòa nhà và bạn cùng phòng sau khi hợp đồng còn hiệu lực được gắn phòng.</div>
          <div className="form-actions form-wide"><button type="button" className="button button-secondary" onClick={onCancel}>Hủy</button><button type="button" className="button button-primary" disabled={!contract.studentSid} onClick={() => setStep(2)}>Tiếp tục</button></div>
        </div>
      ) : (
        <div className="form-grid">
          <label>Ngày bắt đầu<input name="start_date" type="date" value={contract.start_date} onChange={handleChange} required /></label>
          <label>Ngày kết thúc<input name="end_date" type="date" value={contract.end_date} onChange={handleChange} required min={contract.start_date || undefined} /></label>
          <label className="form-wide">Tiền đặt cọc (₫)<input name="deposit_amount" type="number" min="0" value={contract.deposit_amount} onChange={handleChange} required /></label>
          <label className="checkbox-field form-wide"><input name="is_active" type="checkbox" checked={contract.is_active} onChange={handleChange} /> Hợp đồng còn hiệu lực</label>
          <div className="form-wide contract-preview"><strong>Xem trước</strong><span>Sinh viên: {students.find((student) => student.sid === contract.studentSid)?.sname || '—'}</span><span>Thời hạn: {contract.start_date || '—'} đến {contract.end_date || '—'}</span><span>Tiền đặt cọc: {Number(contract.deposit_amount).toLocaleString('vi-VN')} ₫</span></div>
          {error && <p className="form-error form-wide" role="alert">{error}</p>}
          <div className="form-actions form-wide"><button type="button" className="button button-secondary" onClick={() => setStep(1)}>Quay lại</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu hợp đồng'}</button></div>
        </div>
      )}
    </form>
  );
}

export default function ContractsPage() {
  const { data: contracts, isLoading, error, refresh } = useApiResource(contractApi.list);
  const { data: students } = useApiResource(studentApi.list);
  const { data: rooms } = useApiResource(roomApi.list);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [signedFrom, setSignedFrom] = useState('');
  const [signedUntil, setSignedUntil] = useState('');
  const [activeContract, setActiveContract] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [actionError, setActionError] = useState('');
  const [paymentContract, setPaymentContract] = useState(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => contracts.filter((contract) => {
    const studentName = contract.student?.sname || contract.student?.sid || '';
    const matchesSearch = `${contract.contract_id} ${studentName}`.toLowerCase().includes(search.trim().toLowerCase());
    const signedDate = String(contract.start_date || '').slice(0, 10);
    const matchesDate = (!signedFrom || signedDate >= signedFrom) && (!signedUntil || signedDate <= signedUntil);
    return matchesSearch && matchesDate && (filter === 'all' || getContractState(contract) === filter);
  }), [contracts, filter, search, signedFrom, signedUntil]);

  const closeForm = () => { setFormOpen(false); setActiveContract(null); setSaveError(''); };
  const saveContract = async (contract) => {
    setSaving(true);
    setSaveError('');
    try {
      if (activeContract) await contractApi.update(activeContract.contract_id, contract);
      else await contractApi.create(contract);
      closeForm();
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  };
  const terminate = async (contract) => {
    if (!window.confirm(`Kết thúc hợp đồng #${contract.contract_id}?`)) return;
    try {
      await contractApi.end(contract.contract_id);
      setActionError('');
      refresh();
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };
  const renew = async (contract) => {
    const endDate = window.prompt('Nhập ngày kết thúc mới (YYYY-MM-DD):', String(contract.end_date).slice(0, 10));
    if (!endDate) return;
    try {
      await contractApi.renew(contract.contract_id, endDate);
      setActionError('');
      refresh();
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };
  const liquidate = async (contract) => {
    if (!window.confirm(`Thanh lý hợp đồng #${contract.contract_id} từ hôm nay?`)) return;
    try {
      await contractApi.liquidate(contract.contract_id);
      setActionError('');
      refresh();
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const columns = [
    { key: 'contract_id', label: 'Mã hợp đồng', render: (contract) => `HD-${String(contract.contract_id).padStart(4, '0')}` },
    { key: 'student', label: 'Sinh viên', render: (contract) => contract.student?.sname || contract.student?.sid || 'Chưa liên kết' },
    { key: 'room', label: 'Phòng', render: (contract) => contract.room ? `${contract.room.building} · ${contract.room.roomNumber}` : 'Chưa xếp phòng' },
    { key: 'term', label: 'Thời hạn', render: (contract) => `${new Date(contract.start_date).toLocaleDateString('vi-VN')} – ${new Date(contract.end_date).toLocaleDateString('vi-VN')}` },
    { key: 'deposit_amount', label: 'Tiền đặt cọc', render: (contract) => `${Number(contract.deposit_amount).toLocaleString('vi-VN')} ₫` },
    { key: 'status', label: 'Trạng thái', render: (contract) => <StatusBadge value={getContractState(contract)} label={stateLabels[getContractState(contract)]} /> },
    { key: 'actions', label: 'Thao tác', render: (contract) => (
      <div className="contract-actions">
        <button className="contract-action-button payment" onClick={() => setPaymentContract(contract)}>Thanh toán</button>
        <button className="contract-action-button edit" onClick={() => { setActiveContract(contract); setFormOpen(true); }}>Sửa</button>
        {contract.is_active && (
          <>
            <button className="contract-action-button renew" onClick={() => renew(contract)}>Gia hạn</button>
            <button className="contract-action-button end" onClick={() => terminate(contract)}>Kết thúc</button>
            <button className="contract-action-button liquidate" onClick={() => liquidate(contract)}>Thanh lý</button>
          </>
        )}
      </div>
    ) },
  ];

  return (
    <>
      <PageHeading eyebrow="THỜI HẠN LƯU TRÚ" title="Danh sách hợp đồng" description="Theo dõi thời hạn hợp đồng và trạng thái lưu trú." action={<button className="button button-primary" onClick={() => setFormOpen(true)}>＋ Tạo hợp đồng</button>} />
      <section className="panel">
        {actionError && <p className="form-error contract-action-error" role="alert">{actionError}</p>}
        <div className="table-toolbar contract-toolbar">
          <label className="search-field"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã hợp đồng hoặc sinh viên" aria-label="Tìm hợp đồng" /></label>
          <label className="compact-select">Trạng thái<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Tất cả</option><option value="active">Hiệu lực</option><option value="upcoming">Sắp hết hạn</option><option value="overdue">Quá hạn</option><option value="terminated">Đã thanh lý</option></select></label>
          <label className="compact-select">Từ ngày<input type="date" value={signedFrom} onChange={(event) => setSignedFrom(event.target.value)} /></label>
          <label className="compact-select">Đến ngày<input type="date" value={signedUntil} onChange={(event) => setSignedUntil(event.target.value)} /></label>
        </div>
        <DataTable columns={columns} rows={filtered} rowKey={(contract) => contract.contract_id} isLoading={isLoading} error={error} onRetry={refresh} emptyMessage="Không tìm thấy hợp đồng phù hợp." />
      </section>
      {formOpen && <Modal title={activeContract ? 'Cập nhật / gia hạn hợp đồng' : 'Tạo hợp đồng thuê'} onClose={closeForm} wide><ContractForm initialValue={activeContract} students={students} rooms={rooms} onSave={saveContract} onCancel={closeForm} saving={saving} error={saveError} /></Modal>}
      {paymentContract && <PaymentDialog contract={paymentContract} onClose={() => setPaymentContract(null)} />}
      {!isLoading && !error && contracts.some((contract) => !contract.student) && <p className="form-hint page-footnote">API hợp đồng hiện chưa trả quan hệ sinh viên đầy đủ; một số hồ sơ được đánh dấu “Chưa liên kết”.</p>}
    </>
  );
}
