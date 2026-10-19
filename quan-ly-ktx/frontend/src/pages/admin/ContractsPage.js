import { useMemo, useState } from 'react';
import { contractApi } from '../../api/contract.api';
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
    if (!window.confirm(`Thanh lý hợp đồng #${contract.contract_id}?`)) return;
    try {
      await contractApi.update(contract.contract_id, { is_active: false });
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
      setActiveContract(contract);
      setFormOpen(true);
    }
  };

  const columns = [
    { key: 'contract_id', label: 'Mã hợp đồng', render: (contract) => `HD-${String(contract.contract_id).padStart(4, '0')}` },
    { key: 'student', label: 'Sinh viên', render: (contract) => contract.student?.sname || contract.student?.sid || 'Chưa liên kết' },
    { key: 'room', label: 'Phòng', render: (contract) => contract.room ? `${contract.room.building} · ${contract.room.roomNumber}` : 'Chưa xếp phòng' },
    { key: 'term', label: 'Thời hạn', render: (contract) => `${new Date(contract.start_date).toLocaleDateString('vi-VN')} – ${new Date(contract.end_date).toLocaleDateString('vi-VN')}` },
    { key: 'deposit_amount', label: 'Tiền đặt cọc', render: (contract) => `${Number(contract.deposit_amount).toLocaleString('vi-VN')} ₫` },
    { key: 'status', label: 'Trạng thái', render: (contract) => <StatusBadge value={getContractState(contract)} label={stateLabels[getContractState(contract)]} /> },
    { key: 'actions', label: '', render: (contract) => <div className="row-actions"><button className="text-button" onClick={() => { setActiveContract(contract); setFormOpen(true); }}>Sửa / Gia hạn</button>{contract.is_active && <button className="text-button danger-text" onClick={() => terminate(contract)}>Thanh lý</button>}</div> },
  ];

  return (
    <>
      <PageHeading eyebrow="THỜI HẠN LƯU TRÚ" title="Danh sách hợp đồng" description="Theo dõi thời hạn hợp đồng và trạng thái lưu trú." action={<button className="button button-primary" onClick={() => setFormOpen(true)}>＋ Tạo hợp đồng</button>} />
      <section className="panel">
        <div className="table-toolbar contract-toolbar">
          <label className="search-field"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã hợp đồng hoặc sinh viên" aria-label="Tìm hợp đồng" /></label>
          <label className="compact-select">Trạng thái<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Tất cả</option><option value="active">Hiệu lực</option><option value="upcoming">Sắp hết hạn</option><option value="overdue">Quá hạn</option><option value="terminated">Đã thanh lý</option></select></label>
          <label className="compact-select">Từ ngày<input type="date" value={signedFrom} onChange={(event) => setSignedFrom(event.target.value)} /></label>
          <label className="compact-select">Đến ngày<input type="date" value={signedUntil} onChange={(event) => setSignedUntil(event.target.value)} /></label>
        </div>
        <DataTable columns={columns} rows={filtered} rowKey={(contract) => contract.contract_id} isLoading={isLoading} error={error} onRetry={refresh} emptyMessage="Không tìm thấy hợp đồng phù hợp." />
      </section>
      {formOpen && <Modal title={activeContract ? 'Cập nhật / gia hạn hợp đồng' : 'Tạo hợp đồng thuê'} onClose={closeForm} wide><ContractForm initialValue={activeContract} students={students} rooms={rooms} onSave={saveContract} onCancel={closeForm} saving={saving} error={saveError} /></Modal>}
      {!isLoading && !error && contracts.some((contract) => !contract.student) && <p className="form-hint page-footnote">API hợp đồng hiện chưa trả quan hệ sinh viên đầy đủ; một số hồ sơ được đánh dấu “Chưa liên kết”.</p>}
    </>
  );
}
