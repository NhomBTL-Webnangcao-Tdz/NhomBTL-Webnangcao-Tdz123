import { useEffect, useState } from 'react';
import './RoomPicker.css';

function getRoomFloor(roomNumber) {
  const number = String(roomNumber);
  return number.length >= 3 && /^\d+$/.test(number) ? Number(number.slice(0, -2)) : null;
}

function getRoomAvailability(room) {
  return Math.max(0, Number(room.maxCapacity) - Number(room.currentOccupancy));
}

export default function RoomPicker({ rooms = [], selectedRoomId = '', onSelect, availableOnly = false, allowUnassigned = false }) {
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState(null);
  const visibleRooms = rooms;
  const buildingNames = [...new Set(visibleRooms.map((room) => room.building).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'vi'));
  const buildings = buildingNames.map((name) => {
    const buildingRooms = visibleRooms.filter((room) => room.building === name);
    const availableRooms = buildingRooms.filter((room) => getRoomAvailability(room) > 0);
    return {
      name,
      roomsCount: buildingRooms.length,
      availableRoomsCount: availableRooms.length,
      availableSlots: availableRooms.reduce((total, room) => total + getRoomAvailability(room), 0),
    };
  });
  const floors = [...new Set(visibleRooms
    .filter((room) => room.building === building)
    .map((room) => getRoomFloor(room.roomNumber))
    .filter((roomFloor) => roomFloor !== null))].sort((a, b) => a - b);
  const floorRooms = visibleRooms
    .filter((room) => room.building === building && getRoomFloor(room.roomNumber) === floor)
    .sort((a, b) => String(a.roomNumber).localeCompare(String(b.roomNumber), 'vi', { numeric: true }));
  const floorSummary = floors.map((number) => {
    const roomsOnFloor = visibleRooms.filter((room) => room.building === building && getRoomFloor(room.roomNumber) === number);
    const availableRooms = roomsOnFloor.filter((room) => getRoomAvailability(room) > 0);
    return {
      number,
      roomsCount: roomsOnFloor.length,
      availableRoomsCount: availableRooms.length,
      availableSlots: availableRooms.reduce((total, room) => total + getRoomAvailability(room), 0),
    };
  });

  useEffect(() => {
    if (!selectedRoomId) return;
    const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
    if (selectedRoom && !building) {
      setBuilding(selectedRoom.building);
      setFloor(getRoomFloor(selectedRoom.roomNumber));
    }
  }, [building, rooms, selectedRoomId]);

  const chooseBuilding = (name) => {
    setBuilding(name);
    setFloor(null);
    onSelect(null);
  };
  const chooseFloor = (number) => {
    setFloor(number);
    onSelect(null);
  };

  return (
    <section className="room-picker form-wide" aria-label="Chọn tòa nhà, tầng và phòng">
      <div className="room-picker-heading">
        <div>
          <h3>Chọn phòng ở</h3>
          <p>Chọn tòa nhà, tầng, sau đó chọn phòng.</p>
        </div>
        <span className="room-picker-legend"><i className="legend-dot green" /> Còn chỗ <i className="legend-dot red" /> Đã đầy</span>
      </div>
      {allowUnassigned && (
        <button type="button" className={`room-picker-unassigned${!selectedRoomId ? ' selected' : ''}`} onClick={() => {
          setBuilding('');
          setFloor(null);
          onSelect(null);
        }}>
          Chưa xếp phòng
        </button>
      )}
      <div className="building-grid room-picker-buildings">
        {buildings.map((item) => (
          <button
            type="button"
            key={item.name}
            className={`building-card room-building-option${building === item.name ? ' selected' : ''}`}
            onClick={() => chooseBuilding(item.name)}
            aria-pressed={building === item.name}
          >
            <div className="building-card-heading">
              <span className="building-icon">▦</span>
              {building === item.name && <span className="building-arrow" aria-hidden="true">✓</span>}
            </div>
            <h3>Tòa {item.name}</h3>
            <p>{item.roomsCount} phòng · {item.availableRoomsCount} phòng còn chỗ</p>
            <div className="building-stat-row room-picker-building-stats">
              <span><i className="legend-dot green" />{item.availableSlots} chỗ trống</span>
              <span><i className="legend-dot blue" />{item.roomsCount - item.availableRoomsCount} phòng đã đầy</span>
            </div>
          </button>
        ))}
        {!buildings.length && <p className="async-state">Chưa có phòng nào trong hệ thống.</p>}
      </div>
      {building && (
        <div className="room-picker-floor-area">
          <div className="room-picker-subheading"><h4>Tòa {building} · Chọn tầng</h4></div>
          <div className="room-picker-floors">
            {floorSummary.map((item) => (
              <button
                type="button"
                key={item.number}
                className={`room-picker-floor${floor === item.number ? ' selected' : ''}`}
                onClick={() => chooseFloor(item.number)}
                aria-pressed={floor === item.number}
              >
                <strong>Tầng {item.number}</strong>
                <span>{item.availableRoomsCount}/{item.roomsCount} phòng còn chỗ</span>
                <small>{item.availableSlots} chỗ trống</small>
              </button>
            ))}
            {!floors.length && <p className="async-state">Tòa này chưa có tầng/phòng phù hợp.</p>}
          </div>
        </div>
      )}
      {building && floor !== null && (
        <div className="room-picker-floor-area">
          <div className="room-picker-subheading">
            <h4>Tầng {floor} · {floorRooms.filter((room) => getRoomAvailability(room) > 0).length} phòng còn chỗ</h4>
          </div>
          {floorRooms.length ? (
            <div className="room-grid room-picker-grid">
              {floorRooms.map((room) => {
                const slots = getRoomAvailability(room);
                const full = slots === 0;
                const disabled = full && availableOnly && room.id !== selectedRoomId;
                return (
                  <button
                    type="button"
                    key={room.id}
                    className={`room-card room-picker-card${full ? ' room-full' : slots === Number(room.maxCapacity) ? ' room-available' : ' room-occupied'}${selectedRoomId === room.id ? ' selected' : ''}`}
                    onClick={() => onSelect(room)}
                    disabled={disabled}
                    aria-pressed={selectedRoomId === room.id}
                    aria-label={`Phòng ${room.roomNumber}, ${full ? 'đã đầy' : `còn ${slots} chỗ`}, ${room.currentOccupancy} trên ${room.maxCapacity} người`}
                  >
                    <div className="room-card-top">
                      <span className="room-door" aria-hidden="true">⌂</span>
                      <span className={`room-picker-status${full ? ' full' : ''}`}>{full ? 'Đã đầy' : `Còn ${slots} chỗ`}</span>
                    </div>
                    <strong className="room-number">P.{room.roomNumber}</strong>
                    <span className="room-occupancy">{room.currentOccupancy} / {room.maxCapacity} người</span>
                    <span className="room-price">{Number(room.price).toLocaleString('vi-VN')} ₫ <small>/ tháng</small></span>
                  </button>
                );
              })}
            </div>
          ) : <p className="async-state">Tầng này chưa có phòng.</p>}
        </div>
      )}
    </section>
  );
}
