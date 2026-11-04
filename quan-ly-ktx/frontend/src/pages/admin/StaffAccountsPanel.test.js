import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userApi } from '../../api/user.api';
import { useAuth } from '../../context/AuthContext';
import StaffAccountsPanel from './StaffAccountsPanel';

jest.mock('../../api/user.api', () => ({
  userApi: { list: jest.fn(), createManager: jest.fn(), updateRole: jest.fn() },
}));
jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

const accounts = [
  { id: 1, username: 'test-admin', role: 'ADMIN', createdAt: '2026-11-01T00:00:00.000Z' },
  { id: 2, username: 'test-canbo', role: 'MANAGER', createdAt: '2026-11-02T00:00:00.000Z' },
];

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: { username: 'test-admin' } });
  userApi.list.mockResolvedValue(accounts);
  window.confirm = jest.fn(() => true);
});

test('hiện danh sách, khóa đổi vai trò của chính mình', async () => {
  render(<StaffAccountsPanel />);
  expect(await screen.findByText('test-canbo')).toBeInTheDocument();
  expect(screen.getByLabelText('Vai trò của test-admin')).toBeDisabled();
  expect(screen.getByLabelText('Vai trò của test-canbo')).toBeEnabled();
});

test('tạo cán bộ rồi xóa form và tải lại danh sách', async () => {
  userApi.createManager.mockResolvedValue({ username: 'test-moi' });
  render(<StaffAccountsPanel />);
  await screen.findByText('test-canbo');
  fireEvent.change(screen.getByLabelText('Tên đăng nhập'), { target: { value: ' test-moi ' } });
  fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'test-mat-khau' } });
  fireEvent.click(screen.getByRole('button', { name: 'Tạo cán bộ' }));
  expect(await screen.findByText('Đã tạo tài khoản cán bộ test-moi.')).toBeInTheDocument();
  expect(userApi.createManager).toHaveBeenCalledWith({ username: 'test-moi', password: 'test-mat-khau' });
  expect(screen.getByLabelText('Mật khẩu')).toHaveValue('');
  await waitFor(() => expect(userApi.list).toHaveBeenCalledTimes(2));
});

test('báo lỗi từ backend khi trùng tên', async () => {
  userApi.createManager.mockRejectedValue(new Error('Username đã được sử dụng.'));
  render(<StaffAccountsPanel />);
  await screen.findByText('test-canbo');
  fireEvent.change(screen.getByLabelText('Tên đăng nhập'), { target: { value: 'test-canbo' } });
  fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'test-mat-khau' } });
  fireEvent.click(screen.getByRole('button', { name: 'Tạo cán bộ' }));
  expect(await screen.findByText('Username đã được sử dụng.')).toBeInTheDocument();
});

test('đổi vai trò cần xác nhận', async () => {
  window.confirm = jest.fn(() => false);
  render(<StaffAccountsPanel />);
  const select = await screen.findByLabelText('Vai trò của test-canbo');
  fireEvent.change(select, { target: { value: 'STUDENT' } });
  expect(userApi.updateRole).not.toHaveBeenCalled();

  window.confirm = jest.fn(() => true);
  userApi.updateRole.mockResolvedValue({});
  fireEvent.change(select, { target: { value: 'STUDENT' } });
  await waitFor(() => expect(userApi.updateRole).toHaveBeenCalledWith(2, 'STUDENT'));
});

test('tên chứa HTML hiện dưới dạng chữ', async () => {
  userApi.list.mockResolvedValue([{ ...accounts[1], username: '<img src=x onerror=alert(1)>' }]);
  const { container } = render(<StaffAccountsPanel />);
  expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
  expect(container.querySelector('img')).toBeNull();
});

test('hiện lỗi khi không tải được', async () => {
  userApi.list.mockRejectedValue(new Error('Không tải được danh sách.'));
  render(<StaffAccountsPanel />);
  expect(await screen.findByText('Không tải được danh sách.')).toBeInTheDocument();
});
