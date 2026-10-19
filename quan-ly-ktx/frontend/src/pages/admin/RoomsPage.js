import { useMemo, useState } from 'react';
import { roomApi } from '../../api/room.api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import useApiResource from '../../hooks/useApiResource';
import { setHashQuery } from '../../utils/hashRoute';
import './RoomsPage.css';

const emptyRoom = { roomNumber: '', building: '', maxCapacity: 1, price: 0 };

function getRoomStatus(room) {
  if (room.status?.toLowerCase().includes('bảo trì')) return 'maintenance';
  if (Number(room.currentOccupancy) >= Number(room.maxCapacity)) return 'full';
  if (Number(room.currentOccupancy) > 0) return 'occupied';
  return 'available';
}

function getFloor(roomNumber) {
  const digits = String(roomNumber || '').match(/\d+/)?.[0];
  return digits && digits.length >= 3 ? Number(digits[0]) : 1;
}

function RoomForm({ initialValue, onSave, onCancel, saving, error }) {
  const [room, setRoom] = useState(initialValue || emptyRoom);
  const handleChange = (event) => {
    const { name, value } = event.target;
    setRoom((current) => ({ ...current, [name]: ['maxCapacity', 'currentOccupancy', 'price'].includes(name) ? Number(value) : value }));
  };
  return (
    <form className="form-grid" onSubmit={(event) => {
      event.preventDefault();
      onSave({
        roomNumber: room.roomNumber,
        building: room.building,
        maxCapacity: Number(room.maxCapacity),
        price: Number(room.price),
      });
    }}>
      <label>Tòa nhà<input name="building" value={room.building} onChange={handleChange} required /></label>
      <label>Số phòng<input name="roomNumber" value={room.roomNumber} onChange={handleChange} required /></label>
      <label>Sức chứa tối đa<input name="maxCapacity" type="number" min="1" max="10" value={room.maxCapacity} onChange={handleChange} required /></label>
      <label>Giá thuê hàng tháng (₫)<input name="price" type="number" min="0" value={room.price} onChange={handleChange} required /></label>
      <p className="form-hint form-wide">Số người ở do hợp đồng quản lý; API hiện tại tự khởi tạo phòng mới với 0 người. Tòa nhà được suy ra từ thông tin phòng, chưa có API tạo tòa riêng.</p>
      {error && <p className="form-error form-wide" role="alert">{error}</p>}
      <div className="form-actions form-wide"><button type="button" className="button button-secondary" onClick={onCancel}>Hủy</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu phòng'}</button></div>
    </form>
  );
}

function RoomCard({ room, onOpen }) {
  const status = getRoomStatus(room);
  const occupancy = Number(room.currentOccupancy) || 0;
  return (
    <button className={`room-card room-${status}`} onClick={() => onOpen(room)}>
      <div className="room-card-top"><span className="room-door">⌂</span><StatusBadge value={status} label={{ available: 'Còn chỗ', occupied: 'Đang ở', full: 'Đã đầy', maintenance: 'Bảo trì' }[status]} /></div>
      <strong className="room-number">P.{room.roomNumber}</strong>
      <span className="room-occupancy">{occupancy} / {room.maxCapacity} người</span>
      <span className="room-price">{Number(room.price).toLocaleString('vi-VN')} ₫ <small>/ tháng</small></span>
    </button>
  );
}

export default function RoomsPage({ segments, params }) {
  const { data: rooms, isLoading, error, refresh } = useApiResource(roomApi.list);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formMode, setFormMode] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const buildingFromRoute = segments.length > 1 ? decodeURIComponent(segments[1]) : '';
  const selectedRoomId = params.get('viewRoom');
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

  const buildings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return [...new Set(rooms.map((room) => room.building).filter(Boolean))]
      .filter((building) => building.toLowerCase().includes(query))
      .sort((a, b) => a.localeCompare(b, 'vi'));
  }, [rooms, searchTerm]);
  const buildingRooms = rooms.filter((room) => room.building === buildingFromRoute);
  const filteredRooms = buildingRooms.filter((room) => {
    const status = getRoomStatus(room);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesSearch = `${room.roomNumber} ${room.building}`.toLowerCase().includes(searchTerm.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });
  const floorGroups = [...new Set(filteredRooms.map((room) => getFloor(room.roomNumber)))].sort((a, b) => a - b);

  const closeForm = () => {
    setFormMode('');
    setActiveRoom(null);
    setSaveError('');
  };
  const saveRoom = async (room) => {
    setSaving(true);
    setSaveError('');
    try {
      if (formMode === 'edit') await roomApi.update(activeRoom.id, room);
      else await roomApi.create(room);
      closeForm();
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  };
  const deleteRoom = async (room) => {
    if (!window.confirm(`Xóa phòng ${room.roomNumber}?`)) return;
    try {
      await roomApi.remove(room.id);
      setHashQuery('viewRoom', null);
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
    }
  };

  const columns = [
    { key: 'roomNumber', label: 'Phòng', render: (room) => `P.${room.roomNumber}` },
    { key: 'building', label: 'Tòa nhà' },
    { key: 'currentOccupancy', label: 'Đang ở', render: (room) => `${room.currentOccupancy} / ${room.maxCapacity}` },
    { key: 'price', label: 'Giá thuê', render: (room) => `${Number(room.price).toLocaleString('vi-VN')} ₫` },
    { key: 'status', label: 'Trạng thái', render: (room) => <StatusBadge value={getRoomStatus(room)} /> },
  ];

  return (
    <>
      <PageHeading eyebrow="SƠ ĐỒ TÒA NHÀ" title={buildingFromRoute || 'Tòa nhà & Phòng'} description="Theo dõi công suất, trạng thái phòng và số người đang lưu trú." action={<button className="button button-primary" onClick={() => setFormMode('create')}>＋ Thêm phòng</button>} />
      <section className="panel">
        <div className="table-toolbar">
          {buildingFromRoute ? (
            <div className="room-filter-bar">
              <a className="text-link" href="#rooms">← Tất cả tòa nhà</a>
              <label className="compact-select">Trạng thái<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Tất cả</option><option value="available">Còn chỗ</option><option value="occupied">Đang ở</option><option value="full">Đã đầy</option><option value="maintenance">Bảo trì</option></select></label>
            </div>
          ) : (
            <label className="search-field"><span aria-hidden="true">⌕</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm theo tên tòa nhà" aria-label="Tìm tòa nhà" /></label>
          )}
          <button className="button button-secondary" onClick={refresh}>Làm mới</button>
        </div>
        {isLoading ? <p className="async-state" role="status">Đang tải danh sách phòng...</p>
          : error ? <div className="async-state async-error" role="alert"><p>{error}</p><p>API phòng yêu cầu đăng nhập với quyền ADMIN hoặc MANAGER.</p><button className="button button-secondary" onClick={refresh}>Thử lại</button></div>
            : rooms.length === 0 ? <p className="async-state">Chưa có phòng để hiển thị.</p>
              : buildingFromRoute ? (
                <div className="room-map">
                  <div className="room-overview-strip">
                    <span><strong>{buildingRooms.length}</strong> phòng</span>
                    <span><strong>{buildingRooms.filter((room) => Number(room.currentOccupancy) < Number(room.maxCapacity)).length}</strong> còn chỗ</span>
                    <span><strong>{buildingRooms.reduce((sum, room) => sum + Number(room.currentOccupancy || 0), 0)}</strong> sinh viên đang ở</span>
                  </div>
                  {!filteredRooms.length ? <p className="async-state">Không có phòng phù hợp với bộ lọc.</p> : floorGroups.map((floor) => (
                    <section className="floor-group" key={floor}>
                      <div className="floor-heading"><h3>Tầng {floor}</h3><span>{filteredRooms.filter((room) => getFloor(room.roomNumber) === floor).length} phòng</span></div>
                      <div className="room-grid">
                        {filteredRooms.filter((room) => getFloor(room.roomNumber) === floor).map((room) => <RoomCard key={room.id} room={room} onOpen={(selected) => setHashQuery('viewRoom', selected.id)} />)}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="building-grid">
                  {buildings.map((building) => {
                    const buildingData = rooms.filter((room) => room.building === building);
                    const occupiedCount = buildingData.filter((room) => Number(room.currentOccupancy) > 0).length;
                    const vacancyCount = buildingData.filter((room) => Number(room.currentOccupancy) < Number(room.maxCapacity)).length;
                    const capacity = buildingData.reduce((sum, room) => sum + Number(room.maxCapacity || 0), 0);
                    const residents = buildingData.reduce((sum, room) => sum + Number(room.currentOccupancy || 0), 0);
                    const fill = buildingData.length ? Math.round((occupiedCount / buildingData.length) * 100) : 0;
                    return (
                      <a className="building-card" href={`#rooms/${encodeURIComponent(building)}`} key={building}>
                        <div className="building-card-heading"><span className="building-icon">▦</span><span className="building-arrow">↗</span></div>
                        <h3>{building}</h3><p>{buildingData.length} phòng · Sức chứa {capacity} người</p>
                        <div className="building-progress-label"><span>Tỷ lệ lấp đầy</span><strong>{fill}%</strong></div>
                        <div className="progress-track"><span style={{ width: `${fill}%` }} /></div>
                        <div className="building-stat-row"><span><i className="legend-dot green" />{vacancyCount} phòng còn chỗ</span><span><i className="legend-dot blue" />{residents} sinh viên</span></div>
                      </a>
                    );
                  })}
                  {!buildings.length && <p className="async-state">Không tìm thấy tòa nhà nào.</p>}
                </div>
              )}
      </section>
      {buildingFromRoute && !error && !isLoading && (
        <section className="panel data-panel secondary-panel"><div className="panel-heading"><div><h3>Danh sách phòng</h3><p>Bảng dữ liệu chi tiết của {buildingFromRoute}</p></div></div><DataTable columns={columns} rows={filteredRooms} rowKey={(room) => room.id} isLoading={false} error="" emptyMessage="Tòa nhà chưa có phòng." /></section>
      )}
      {formMode && <Modal title={formMode === 'edit' ? 'Cập nhật phòng' : 'Thêm phòng mới'} onClose={closeForm}><RoomForm initialValue={activeRoom} onSave={saveRoom} onCancel={closeForm} saving={saving} error={saveError} /></Modal>}
      {selectedRoom && (
        <Modal title={`Chi tiết phòng ${selectedRoom.roomNumber}`} onClose={() => setHashQuery('viewRoom', null)}>
          <div className="room-detail">
            <StatusBadge value={getRoomStatus(selectedRoom)} />
            {saveError && <p className="form-error" role="alert">{saveError}</p>}
            <dl className="detail-list">
              <div><dt>Tòa nhà</dt><dd>{selectedRoom.building}</dd></div>
              <div><dt>Sức chứa</dt><dd>{selectedRoom.currentOccupancy} / {selectedRoom.maxCapacity} người</dd></div>
              <div><dt>Đơn giá phòng</dt><dd>{Number(selectedRoom.price).toLocaleString('vi-VN')} ₫ / tháng</dd></div>
              <div><dt>Tầng</dt><dd>{getFloor(selectedRoom.roomNumber)}</dd></div>
            </dl>
            <p className="form-hint">API hiện tại chưa liên kết phòng với sinh viên, chỉ số công tơ, hợp đồng hoặc lịch sử hóa đơn.</p>
            <div className="form-actions"><button className="button button-secondary" onClick={() => { setActiveRoom(selectedRoom); setFormMode('edit'); setHashQuery('viewRoom', null); }}>Chỉnh sửa</button><button className="button button-danger" onClick={() => deleteRoom(selectedRoom)}>Xóa phòng</button></div>
          </div>
        </Modal>
      )}
    </>
  );
}
