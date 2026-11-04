import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FeedbackProvider, useFeedback } from './FeedbackProvider';

function Demo({ onResult }) {
  const { notify, confirm } = useFeedback();
  return (
    <>
      <button onClick={() => notify('Đã lưu.')}>Thành công</button>
      <button onClick={() => notify('<b>Lỗi</b>', 'error')}>Lỗi</button>
      <button onClick={async () => onResult(await confirm('Xóa phòng?', 'Xóa'))}>Hỏi</button>
    </>
  );
}

test('hiện thông báo thành công', async () => {
  render(<FeedbackProvider><Demo /></FeedbackProvider>);
  fireEvent.click(screen.getByText('Thành công'));
  expect(await screen.findByText('Đã lưu.')).toBeInTheDocument();
});

test('thông báo chứa HTML hiện dạng chữ', async () => {
  render(<FeedbackProvider><Demo /></FeedbackProvider>);
  fireEvent.click(screen.getByText('Lỗi'));
  expect(await screen.findByText('<b>Lỗi</b>')).toBeInTheDocument();
});

test('hộp xác nhận trả true khi đồng ý, false khi hủy', async () => {
  const onResult = jest.fn();
  render(<FeedbackProvider><Demo onResult={onResult} /></FeedbackProvider>);

  fireEvent.click(screen.getByText('Hỏi'));
  fireEvent.click(await screen.findByRole('button', { name: 'Xóa' }));
  await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(true));

  fireEvent.click(screen.getByText('Hỏi'));
  fireEvent.click(await screen.findByRole('button', { name: 'Hủy' }));
  await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(false));
});

test('ngoài provider vẫn dùng được window.confirm', async () => {
  window.confirm = jest.fn(() => true);
  const onResult = jest.fn();
  render(<Demo onResult={onResult} />);
  fireEvent.click(screen.getByText('Hỏi'));
  await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
  expect(window.confirm).toHaveBeenCalledWith('Xóa phòng?');
});
