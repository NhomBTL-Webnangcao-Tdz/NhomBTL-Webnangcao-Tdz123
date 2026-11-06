import { useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { roomApi } from '../../api/room.api';
import ExportButtons from '../../components/common/ExportButtons';
import Modal from '../../components/common/Modal';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { useFeedback } from '../../components/common/FeedbackProvider';
import useApiResource from '../../hooks/useApiResource';
import { setHashQuery } from '../../utils/hashRoute';
import './RoomsPage.css';

const emptyRoom = { roomNumber: '', building: '', maxCapacity: 1, price: 0, isMaintenance: false };

function getRoomStatus(room) {
  if (room.isMaintenance || room.status?.toLowerCase().includes('bảo trì')) return 'maintenance';
  if (Number(room.currentOccupancy) >= Number(room.maxCapacity)) return 'full';
  if (Number(room.currentOccupancy) > 0) return 'occupied';
  return 'available';
}

const roomStatusLabels = { available: 'Còn chỗ', occupied: 'Đang ở', full: 'Đã đầy', maintenance: 'Bảo trì' };

const exportColumns = [
  { label: 'Tòa nhà', value: (room) => room.building, width: 18 },
  { label: 'Phòng', value: (room) => room.roomNumber, width: 10 },
  { label: 'Đang ở', value: (room) => Number(room.currentOccupancy) || 0, width: 10 },
  { label: 'Sức chứa', value: (room) => Number(room.maxCapacity) || 0, width: 10 },
  { label: 'Giá thuê / tháng', value: (room) => Number(room.price) || 0, width: 18, money: true },
  { label: 'Trạng thái', value: (room) => roomStatusLabels[getRoomStatus(room)], width: 12 },
];

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
    <Form className="form-grid" onSubmit={(event) => {
      event.preventDefault();
      onSave({
        roomNumber: room.roomNumber,
        building: room.building,
        maxCapacity: Number(room.maxCapacity),
        price: Number(room.price),
        isMaintenance: Boolean(room.isMaintenance),
      });
    }}>
      <label>Tòa nhà<Form.Control name="building" value={room.building} onChange={handleChange} required /></label>
      <label>Số phòng<Form.Control name="roomNumber" value={room.roomNumber} onChange={handleChange} required /></label>
      <label>Sức chứa tối đa<Form.Control name="maxCapacity" type="number" min="1" max="10" value={room.maxCapacity} onChange={handleChange} required /></label>
      <label>Giá thuê hàng tháng (₫)<Form.Control name="price" type="number" min="0" value={room.price} onChange={handleChange} required /></label>
      <label className="form-wide">Trạng thái phòng<Form.Select name="isMaintenance" value={room.isMaintenance ? 'true' : 'false'} onChange={(event) => setRoom((current) => ({ ...current, isMaintenance: event.target.value === 'true' }))}><option value="false">Đang sử dụng</option><option value="true">Bảo trì</option></Form.Select></label>
      <p className="form-hint form-wide">Số người ở do hợp đồng quản lý; API hiện tại tự khởi tạo phòng mới với 0 người. Tòa nhà được suy ra từ thông tin phòng, chưa có API tạo tòa riêng.</p>
      {error && <p className="form-error form-wide" role="alert">{error}</p>}
      <div className="form-actions form-wide"><Button variant="outline-secondary" type="button" className="button button-secondary" onClick={onCancel}>Hủy</Button><Button variant="primary" type="submit" className="button button-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu phòng'}</Button></div>
    </Form>
  );
}

function BulkRoomPricesForm({ rooms, onSave, onCancel, saving, error }) {
  const [prices, setPrices] = useState(() => rooms.map((room) => ({
    id: room.id,
    roomNumber: room.roomNumber,
    price: String(room.price),
    selected: true,
  })));
  const selectedCount = prices.filter((room) => room.selected).length;

  return (
    <Form className="bulk-prices-form" onSubmit={(event) => {
      event.preventDefault();
      onSave(prices
        .filter((room) => room.selected)
        .map((room) => ({ id: room.id, price: Number(room.price) })));
    }}>
      <p className="form-hint">Chọn các phòng cần cập nhật và nhập giá thuê mới cho từng phòng.</p>
      <div className="bulk-price-list">
        {prices.map((room, index) => (
          <label className={`bulk-price-row${room.selected ? ' selected' : ''}`} key={room.id}>
            <Form.Check.Input
              type="checkbox"
              checked={room.selected}
              onChange={(event) => setPrices((current) => current.map((item, itemIndex) => (
                itemIndex === index ? { ...item, selected: event.target.checked } : item
              )))}
              aria-label={`Cập nhật giá phòng ${room.roomNumber}`}
            />
            <strong>P.{room.roomNumber}</strong>
            <span>₫ / tháng</span>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={room.price}
              onChange={(event) => setPrices((current) => current.map((item, itemIndex) => (
                itemIndex === index ? { ...item, price: event.target.value } : item
              )))}
              aria-label={`Giá mới phòng ${room.roomNumber}`}
              disabled={!room.selected}
              required={room.selected}
            />
          </label>
        ))}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <Button variant="outline-secondary" type="button" className="button button-secondary" onClick={onCancel}>Hủy</Button>
        <Button variant="primary" type="submit" className="button button-primary" disabled={saving || !selectedCount}>
          {saving ? 'Đang cập nhật...' : `Cập nhật ${selectedCount} phòng`}
        </Button>
      </div>
    </Form>
  );
}

function RoomCard({ room, onOpen }) {
  const status = getRoomStatus(room);
  const occupancy = Number(room.currentOccupancy) || 0;
  return (
    <button className={`room-card room-${status}`} onClick={() => onOpen(room)}>
      <div className="room-card-top"><span className="room-door">⌂</span><StatusBadge value={status} label={roomStatusLabels[status]} /></div>
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
  const [residents, setResidents] = useState([]);
  const [residentsLoading, setResidentsLoading] = useState(false);
  const [residentsError, setResidentsError] = useState('');
  const [bulkPricesOpen, setBulkPricesOpen] = useState(false);
  const [bulkPricesError, setBulkPricesError] = useState('');
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const buildingFromRoute = segments.length > 1 ? decodeURIComponent(segments[1]) : '';
  const selectedRoomId = params.get('viewRoom');
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

  useEffect(() => {
    if (!selectedRoomId) {
      setResidents([]);
      setResidentsError('');
      return undefined;
    }

    let active = true;
    setResidentsLoading(true);
    setResidentsError('');
    roomApi.residents(selectedRoomId)
      .then((result) => {
        if (active) setResidents(result);
      })
      .catch((requestError) => {
        if (active) setResidentsError(requestError.message);
      })
      .finally(() => {
        if (active) setResidentsLoading(false);
      });

    return () => { active = false; };
  }, [selectedRoomId]);

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
  const exportRows = buildingFromRoute ? filteredRooms : rooms.filter((room) => buildings.includes(room.building));
  const floorGroups = [...new Set(filteredRooms.map((room) => getFloor(room.roomNumber)))].sort((a, b) => a - b);

  const closeForm = () => {
    setFormMode('');
    setActiveRoom(null);
    setSaveError('');
  };
  const { notify, confirm } = useFeedback();
  const saveRoom = async (room) => {
    setSaving(true);
    setSaveError('');
    try {
      if (formMode === 'edit') await roomApi.update(activeRoom.id, room);
      else await roomApi.create(room);
      notify(formMode === 'edit' ? 'Đã cập nhật phòng.' : 'Đã thêm phòng.');
      closeForm();
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  };
  const deleteRoom = async (room) => {
    if (!(await confirm(`Xóa phòng ${room.roomNumber}?`, 'Xóa'))) return;
    try {
      await roomApi.remove(room.id);
      setHashQuery('viewRoom', null);
      notify('Đã xóa phòng.');
      refresh();
    } catch (requestError) {
      notify(requestError.message, 'error');
    }
  };

  const updateBulkPrices = async (roomPrices) => {
    setUpdatingPrices(true);
    setBulkPricesError('');
    try {
      await roomApi.updatePrices(roomPrices);
      setBulkPricesOpen(false);
      refresh();
    } catch (requestError) {
      setBulkPricesError(requestError.message);
    } finally {
      setUpdatingPrices(false);
    }
  };

  return (
    <>
      <PageHeading eyebrow="SƠ ĐỒ TÒA NHÀ" title={buildingFromRoute || 'Tòa nhà & Phòng'} description="Theo dõi công suất, trạng thái phòng và số người đang lưu trú." action={<Button variant="primary" className="button button-primary" onClick={() => setFormMode('create')}>＋ Thêm phòng</Button>} />
      <section className="panel">
        <div className="table-toolbar">
          {buildingFromRoute ? (
            <div className="room-filter-bar">
              <a className="text-link" href="#rooms">← Tất cả tòa nhà</a>
              <label className="compact-select">Trạng thái<Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Tất cả</option><option value="available">Còn chỗ</option><option value="occupied">Đang ở</option><option value="full">Đã đầy</option><option value="maintenance">Bảo trì</option></Form.Select></label>
              <Button variant="outline-secondary" className="button button-secondary" onClick={() => { setBulkPricesError(''); setBulkPricesOpen(true); }} disabled={!filteredRooms.length}>Chỉnh giá nhiều phòng</Button>
            </div>
          ) : (
            <label className="search-field"><span aria-hidden="true">⌕</span><Form.Control value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm theo tên tòa nhà" aria-label="Tìm tòa nhà" /></label>
          )}
          <div className="export-buttons">
            <ExportButtons title={buildingFromRoute ? `Danh sách phòng ${buildingFromRoute}` : 'Danh sách phòng'} fileName="danh-sach-phong" columns={exportColumns} rows={exportRows} />
            <Button variant="outline-secondary" className="button button-secondary" onClick={refresh}>Làm mới</Button>
          </div>
        </div>
        {isLoading ? <p className="async-state" role="status">Đang tải danh sách phòng...</p>
          : error ? <div className="async-state async-error" role="alert"><p>{error}</p><p>API phòng yêu cầu đăng nhập với quyền ADMIN hoặc MANAGER.</p><Button variant="outline-secondary" className="button button-secondary" onClick={refresh}>Thử lại</Button></div>
            : rooms.length === 0 ? <p className="async-state">Chưa có phòng để hiển thị.</p>
              : buildingFromRoute ? (
                <div className="room-map">
                  <div className="room-overview-strip">
                    <span><strong>{buildingRooms.length}</strong> phòng</span>
                    <span><strong>{buildingRooms.filter((room) => !room.isMaintenance && Number(room.currentOccupancy) < Number(room.maxCapacity)).length}</strong> còn chỗ</span>
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
                    const vacancyCount = buildingData.filter((room) => !room.isMaintenance && Number(room.currentOccupancy) < Number(room.maxCapacity)).length;
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
      {bulkPricesOpen && <Modal title={`Chỉnh giá phòng · ${buildingFromRoute}`} onClose={() => setBulkPricesOpen(false)}><BulkRoomPricesForm rooms={filteredRooms} onSave={updateBulkPrices} onCancel={() => setBulkPricesOpen(false)} saving={updatingPrices} error={bulkPricesError} /></Modal>}
      {formMode && <Modal title={formMode === 'edit' ? 'Cập nhật phòng' : 'Thêm phòng mới'} onClose={closeForm}><RoomForm initialValue={activeRoom} onSave={saveRoom} onCancel={closeForm} saving={saving} error={saveError} /></Modal>}
      {selectedRoom && (
        <Modal title={`Chi tiết phòng ${selectedRoom.roomNumber}`} onClose={() => setHashQuery('viewRoom', null)}>
          <div className="room-detail">
            <StatusBadge value={getRoomStatus(selectedRoom)} label={roomStatusLabels[getRoomStatus(selectedRoom)]} />
            {saveError && <p className="form-error" role="alert">{saveError}</p>}
            <dl className="detail-list">
              <div><dt>Tòa nhà</dt><dd>{selectedRoom.building}</dd></div>
              <div><dt>Sức chứa</dt><dd>{selectedRoom.currentOccupancy} / {selectedRoom.maxCapacity} người</dd></div>
              <div><dt>Đơn giá phòng</dt><dd>{Number(selectedRoom.price).toLocaleString('vi-VN')} ₫ / tháng</dd></div>
              <div><dt>Tầng</dt><dd>{getFloor(selectedRoom.roomNumber)}</dd></div>
            </dl>
            <section className="room-residents">
              <h3>Sinh viên đang ở ({residents.length})</h3>
              {residentsLoading ? <p className="async-state">Đang tải danh sách sinh viên...</p>
                : residentsError ? <div className="async-error" role="alert"><p>{residentsError}</p><Button variant="link" className="text-button" onClick={() => {
                  setResidentsLoading(true);
                  setResidentsError('');
                  roomApi.residents(selectedRoom.id)
                    .then(setResidents)
                    .catch((requestError) => setResidentsError(requestError.message))
                    .finally(() => setResidentsLoading(false));
                }}>Thử lại</Button></div>
                  : residents.length ? (
                    <ul className="room-resident-list">
                      {residents.map((student) => (
                        <li key={student.sid}>
                          <span className="room-resident-avatar" aria-hidden="true">{student.sname?.charAt(0) || student.sid.charAt(0)}</span>
                          <span><strong>{student.sname}</strong><small>{student.sid} · {student.phone}</small></span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="form-hint">Hiện chưa có sinh viên đang lưu trú tại phòng này.</p>}
            </section>
            <div className="form-actions"><Button variant="outline-secondary" className="button button-secondary" onClick={() => { setActiveRoom(selectedRoom); setFormMode('edit'); setHashQuery('viewRoom', null); }}>Chỉnh sửa</Button><button className="button button-danger" onClick={() => deleteRoom(selectedRoom)}>Xóa phòng</button></div>
          </div>
        </Modal>
      )}
    </>
  );
}
