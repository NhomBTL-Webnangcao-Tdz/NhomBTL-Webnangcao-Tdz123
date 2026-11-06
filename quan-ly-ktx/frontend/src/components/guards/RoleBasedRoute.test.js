import { render, screen } from '@testing-library/react';
import { useAuth } from '../../context/AuthContext';
import RoleBasedRoute from './RoleBasedRoute';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

const renderRoute = (auth, roles) => {
  useAuth.mockReturnValue(auth);
  render(<RoleBasedRoute roles={roles}><p>Nội dung bảo vệ</p></RoleBasedRoute>);
};

test('đang kiểm tra phiên thì hiện trạng thái tải, chưa lộ nội dung', () => {
  renderRoute({ user: null, isReady: false }, ['ADMIN']);

  expect(screen.getByRole('status')).toHaveTextContent('Đang xác thực phiên đăng nhập...');
  expect(screen.queryByText('Nội dung bảo vệ')).not.toBeInTheDocument();
});

test('chưa đăng nhập thì yêu cầu đăng nhập', () => {
  renderRoute({ user: null, isReady: true }, ['ADMIN']);

  expect(screen.getByRole('heading', { name: 'Vui lòng đăng nhập' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Đăng nhập để tiếp tục' })).toHaveAttribute('href', '#login');
  expect(screen.queryByText('Nội dung bảo vệ')).not.toBeInTheDocument();
});

test('sai vai trò thì báo không đủ quyền', () => {
  renderRoute({ user: { role: 'STUDENT' }, isReady: true }, ['ADMIN']);

  expect(screen.getByRole('heading', { name: 'Không đủ quyền truy cập' })).toBeInTheDocument();
  expect(screen.queryByText('Nội dung bảo vệ')).not.toBeInTheDocument();
});

test('đúng vai trò thì hiện nội dung', () => {
  renderRoute({ user: { role: 'ADMIN' }, isReady: true }, ['ADMIN']);

  expect(screen.getByText('Nội dung bảo vệ')).toBeInTheDocument();
});

test('không khai báo roles thì mọi tài khoản đã đăng nhập đều vào được', () => {
  renderRoute({ user: { role: 'STUDENT' }, isReady: true });

  expect(screen.getByText('Nội dung bảo vệ')).toBeInTheDocument();
});
