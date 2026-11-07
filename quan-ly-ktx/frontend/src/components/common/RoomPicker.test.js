import { fireEvent, render, screen } from '@testing-library/react';
import RoomPicker from './RoomPicker';

const room = (id, roomNumber, building = 'A') => ({
  id,
  roomNumber,
  building,
  maxCapacity: 4,
  currentOccupancy: 1,
  price: 1000000,
  isMaintenance: false,
});

test('chọn được phòng có tiền tố tòa như dữ liệu demo A101', () => {
  const onSelect = jest.fn();
  const a101 = room('r1', 'A101');
  render(<RoomPicker rooms={[a101, room('r2', 'A201')]} onSelect={onSelect} />);

  fireEvent.click(screen.getByRole('button', { name: /Tòa A/ }));
  expect(screen.queryByText('Tòa này chưa có tầng/phòng phù hợp.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Tầng 1/ }));
  fireEvent.click(screen.getByRole('button', { name: /Phòng A101/ }));

  expect(onSelect).toHaveBeenLastCalledWith(a101);
});

test('vẫn tách tầng đúng với số phòng toàn chữ số', () => {
  render(<RoomPicker rooms={[room('r1', '301'), room('r2', '1205')]} onSelect={jest.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: /Tòa A/ }));

  expect(screen.getByRole('button', { name: /Tầng 3/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Tầng 12/ })).toBeInTheDocument();
});

test('số phòng ngắn được xếp vào tầng 1 để vẫn chọn được', () => {
  render(<RoomPicker rooms={[room('r1', 'E2E1')]} onSelect={jest.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: /Tòa A/ }));

  expect(screen.getByRole('button', { name: /Tầng 1/ })).toBeInTheDocument();
});
