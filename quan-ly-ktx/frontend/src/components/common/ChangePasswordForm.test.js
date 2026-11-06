import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { authApi } from '../../api/auth.api';
import ChangePasswordForm from './ChangePasswordForm';
import { FeedbackProvider } from './FeedbackProvider';

jest.mock('../../api/auth.api', () => ({ authApi: { changePassword: jest.fn() } }));

function fill(current, next, confirm = next) {
  fireEvent.change(screen.getByLabelText('Mật khẩu hiện tại'), { target: { value: current } });
  fireEvent.change(screen.getByLabelText('Mật khẩu mới'), { target: { value: next } });
  fireEvent.change(screen.getByLabelText('Nhập lại mật khẩu mới'), { target: { value: confirm } });
  fireEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));
}

function setup() {
  const onDone = jest.fn();
  render(<FeedbackProvider><ChangePasswordForm onDone={onDone} /></FeedbackProvider>);
  return onDone;
}

beforeEach(() => authApi.changePassword.mockReset());

test('đổi thành công thì gửi đúng 2 trường, báo toast và đóng form', async () => {
  authApi.changePassword.mockResolvedValue({ message: 'ok' });
  const onDone = setup();

  fill('mat-khau-cu', 'mat-khau-moi');

  await waitFor(() => expect(onDone).toHaveBeenCalled());
  expect(authApi.changePassword).toHaveBeenCalledWith({ currentPassword: 'mat-khau-cu', newPassword: 'mat-khau-moi' });
  expect(await screen.findByText('Đã đổi mật khẩu.')).toBeInTheDocument();
});

test.each([
  ['mật khẩu mới quá ngắn', 'mat-khau-cu', '12345', '12345', 'Mật khẩu mới phải có ít nhất 6 ký tự.'],
  ['mật khẩu mới trùng mật khẩu cũ', 'mat-khau-cu', 'mat-khau-cu', 'mat-khau-cu', 'Mật khẩu mới phải khác mật khẩu hiện tại.'],
  ['nhập lại không khớp', 'mat-khau-cu', 'mat-khau-moi', 'khac-hoan-toan', 'Mật khẩu nhập lại không khớp.'],
])('%s thì báo lỗi, không gọi API', (_name, current, next, confirm, message) => {
  setup();

  fill(current, next, confirm);

  expect(screen.getByRole('alert')).toHaveTextContent(message);
  expect(authApi.changePassword).not.toHaveBeenCalled();
});

test('lỗi từ backend hiện trong form, form vẫn mở để sửa', async () => {
  authApi.changePassword.mockRejectedValue(new Error('Mật khẩu hiện tại không đúng.'));
  const onDone = setup();

  fill('sai-mat-khau', 'mat-khau-moi');

  expect(await screen.findByText('Mật khẩu hiện tại không đúng.')).toBeInTheDocument();
  expect(onDone).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Đổi mật khẩu' })).toBeEnabled();
});
