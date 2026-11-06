import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { exportExcel } from '../../utils/exportExcel';
import ExportButtons from './ExportButtons';
import { FeedbackProvider } from './FeedbackProvider';

jest.mock('../../utils/exportExcel', () => ({ exportExcel: jest.fn() }));

const columns = [
  { label: 'Phòng', value: (row) => row.room },
  { label: 'Giá', value: (row) => row.price, money: true },
];

function setup(rows = [{ room: 'A101', price: 1200000 }]) {
  render(<FeedbackProvider><ExportButtons title="Danh sách phòng" fileName="danh-sach-phong" columns={columns} rows={rows} /></FeedbackProvider>);
}

beforeEach(() => {
  exportExcel.mockReset();
  window.print = jest.fn();
});

test('không có dòng nào thì khóa cả hai nút', () => {
  setup([]);

  expect(screen.getByRole('button', { name: 'Xuất Excel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Xuất PDF' })).toBeDisabled();
});

test('xuất Excel gửi đúng dữ liệu, tên file có ngày, báo số dòng', async () => {
  exportExcel.mockResolvedValue();
  setup();

  fireEvent.click(screen.getByRole('button', { name: 'Xuất Excel' }));

  expect(await screen.findByText('Đã xuất 1 dòng ra file Excel.')).toBeInTheDocument();
  expect(exportExcel).toHaveBeenCalledWith(expect.objectContaining({
    fileName: expect.stringMatching(/^danh-sach-phong-\d{4}-\d{2}-\d{2}$/),
    sheetName: 'Danh sách phòng',
    rows: [{ room: 'A101', price: 1200000 }],
  }));
});

test('xuất Excel lỗi thì báo lỗi và bấm lại được', async () => {
  exportExcel.mockRejectedValue(new Error('hỏng'));
  setup();

  fireEvent.click(screen.getByRole('button', { name: 'Xuất Excel' }));

  expect(await screen.findByText('Không thể tạo file Excel. Vui lòng thử lại.')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Xuất Excel' })).toBeEnabled());
});

test('xuất PDF dựng bảng in, gọi hộp in, in xong thì dọn', () => {
  setup();

  fireEvent.click(screen.getByRole('button', { name: 'Xuất PDF' }));

  expect(window.print).toHaveBeenCalledTimes(1);
  expect(document.body).toHaveClass('printing-sheet');
  expect(screen.getByRole('table')).toHaveTextContent('A101');
  expect(screen.getByRole('table')).toHaveTextContent('1.200.000 ₫');

  act(() => { window.dispatchEvent(new Event('afterprint')); });

  expect(document.body).not.toHaveClass('printing-sheet');
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

test('dữ liệu chứa HTML hiện dạng chữ trong bảng in', () => {
  setup([{ room: '<img src=x onerror=alert(1)>', price: 0 }]);

  fireEvent.click(screen.getByRole('button', { name: 'Xuất PDF' }));

  expect(screen.getByRole('table')).toHaveTextContent('<img src=x onerror=alert(1)>');
  expect(screen.getByRole('table').querySelector('img')).toBeNull();
  act(() => { window.dispatchEvent(new Event('afterprint')); });
});
