import { useMemo, useState } from 'react';
import { residenceApi } from '../../api/residence.api';
import { roomApi } from '../../api/room.api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import PageHeading from '../../components/common/PageHeading';
import RoomPicker from '../../components/common/RoomPicker';
import StatusBadge from '../../components/common/StatusBadge';
import useApiResource from '../../hooks/useApiResource';

const statusLabels = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối' };

function ApproveForm({ request, rooms, onApprove, onCancel, saving, error }) {
  const [roomId, setRoomId] = useState('');
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().slice(0, 10);
  });
  const [depositAmount, setDepositAmount] = useState(0);
  const selectedRoom = rooms.find((room) => room.id === roomId);

  return (
    <form className="form-grid" onSubmit={(event) => {
      event.preventDefault();
      onApprove(request.id, { roomId, endDate, depositAmount: Number(depositAmount) });
    }}>
      <p className="form-hint form-wide">Sinh viên: <strong>{request.student?.sname}</strong> · {request.student?.sid}</p>
      {request.note && <p className="inline-notice form-wide">Ghi chú sinh viên: {request.note}</p>}
      <RoomPicker
        rooms={rooms}
        selectedRoomId={roomId}
        availableOnly
        onSelect={(room) => {
          setRoomId(room?.id || '');
          setDepositAmount(room?.price || 0);
        }}
      />
      <label>Ngày kết thúc lưu trú<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required min={new Date().toISOString().slice(0, 10)} /></label>
      <label>Tiền đặt cọc (₫)<input type="number" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} required min="0" /></label>
      {selectedRoom && <p className="form-hint form-wide">Phòng {selectedRoom.roomNumber}, {selectedRoom.building} · Sức chứa {selectedRoom.maxCapacity} sinh viên.</p>}
      {error && <p className="form-error form-wide" role="alert">{error}</p>}
      <div className="form-actions form-wide">
        <button type="button" className="button button-secondary" onClick={onCancel}>Hủy</button>
        <button type="submit" className="button button-primary" disabled={saving || !selectedRoom || Number(selectedRoom.currentOccupancy) >= Number(selectedRoom.maxCapacity)}>{saving ? 'Đang duyệt...' : 'Duyệt và xếp phòng'}</button>
      </div>
    </form>
  );
}

export default function ResidenceRequestsPage() {
  const { data: requests, isLoading, error, refresh } = useApiResource(residenceApi.list);
  const { data: rooms } = useApiResource(roomApi.list);
  const [filter, setFilter] = useState('PENDING');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const visibleRequests = useMemo(() => filter === 'ALL'
    ? requests
    : requests.filter((request) => request.status === filter), [filter, requests]);

  const approve = async (id, details) => {
    setSaving(true);
    setSaveError('');
    try {
      await residenceApi.approve(id, details);
      setSelectedRequest(null);
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const reject = async (request) => {
    const reviewNote = window.prompt(`Lý do từ chối yêu cầu của ${request.student?.sname || request.student?.sid}?`);
    if (reviewNote === null) return;
    try {
      await residenceApi.reject(request.id, reviewNote.trim());
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
    }
  };

  const columns = [
    { key: 'student', label: 'Sinh viên', render: (request) => <span className="identity-cell"><span className="identity-avatar">{request.student?.sname?.slice(0, 1) || 'S'}</span><span><strong>{request.student?.sname || '—'}</strong><small>{request.student?.sid} · {request.student?.phone}</small></span></span> },
    { key: 'requestedAt', label: 'Ngày gửi', render: (request) => new Date(request.requestedAt).toLocaleDateString('vi-VN') },
    { key: 'note', label: 'Ghi chú', render: (request) => request.note || '—' },
    { key: 'status', label: 'Trạng thái', render: (request) => <StatusBadge value={request.status === 'APPROVED' ? 'paid' : request.status === 'REJECTED' ? 'overdue' : 'upcoming'} label={statusLabels[request.status]} /> },
    { key: 'review', label: '', render: (request) => request.status === 'PENDING' ? <div className="row-actions"><button className="text-button" onClick={() => { setSaveError(''); setSelectedRequest(request); }}>Duyệt / xếp phòng</button><button className="text-button danger-text" onClick={() => reject(request)}>Từ chối</button></div> : request.reviewNote || '—' },
  ];

  return (
    <>
      <PageHeading eyebrow="TIẾP NHẬN SINH VIÊN" title="Yêu cầu lưu trú" description="Xem hồ sơ đăng ký, duyệt yêu cầu và phân phòng cho sinh viên." />
      {saveError && !selectedRequest && <div className="inline-notice" role="alert">{saveError}</div>}
      <section className="panel">
        <div className="table-toolbar">
          <label className="compact-select">Trạng thái<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="PENDING">Chờ duyệt</option><option value="APPROVED">Đã duyệt</option><option value="REJECTED">Đã từ chối</option><option value="ALL">Tất cả</option></select></label>
          <span className="toolbar-count">{requests.filter((request) => request.status === 'PENDING').length} yêu cầu chờ duyệt</span>
        </div>
        <DataTable columns={columns} rows={visibleRequests} rowKey={(request) => request.id} isLoading={isLoading} error={error} onRetry={refresh} emptyMessage="Không có yêu cầu lưu trú ở trạng thái này." />
      </section>
      {selectedRequest && <Modal title="Duyệt yêu cầu và phân phòng" onClose={() => setSelectedRequest(null)}><ApproveForm request={selectedRequest} rooms={rooms} onApprove={approve} onCancel={() => setSelectedRequest(null)} saving={saving} error={saveError} /></Modal>}
    </>
  );
}
