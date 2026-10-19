import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

function jsonResponse(payload, ok = true, status = 200) {
  return {
    ok,
    status,
    headers: { get: () => 'application/json' },
    json: async () => payload,
  };
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  global.fetch = jest.fn();
});

afterEach(() => {
  window.history.replaceState({}, '', '/');
  localStorage.clear();
});

test('opens the public landing page at the site root', async () => {
  render(<App />);

  expect(await screen.findByRole('heading', { level: 1, name: 'KTX Care' })).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: 'Điều hướng trang chủ' })).toBeInTheDocument();
  expect(screen.queryByRole('navigation', { name: 'Điều hướng chính' })).not.toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Đăng nhập' })[0]).toHaveAttribute('href', '#login');
});

test('shows the workspace shortcut on the landing page for a signed-in user', async () => {
  localStorage.setItem('ktx_access_token', 'test-token');
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 5, username: 'student.one', role: 'STUDENT' });
    return jsonResponse([]);
  });
  window.history.replaceState({}, '', '/#home');

  render(<App />);

  const shortcuts = await screen.findAllByRole('link', { name: 'Vào hệ thống' });
  expect(shortcuts[0]).toHaveAttribute('href', '#my-profile');
  expect(screen.queryByRole('link', { name: 'Đăng ký' })).not.toBeInTheDocument();
});

test('opens a standalone login page when entering without an authenticated session', async () => {
  window.history.replaceState({}, '', '/#login');

  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Đăng nhập hệ thống' })).toBeInTheDocument();
  expect(screen.queryByRole('navigation', { name: 'Điều hướng chính' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Chào mừng trở lại' })).not.toBeInTheDocument();
  expect(screen.getByRole('contentinfo')).toHaveTextContent('Hệ thống quản lý ký túc xá');
});

test('opens registration as a standalone authentication screen, not an app navigation page', async () => {
  window.history.replaceState({}, '', '/#register');

  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Tạo tài khoản sinh viên' })).toBeInTheDocument();
  expect(screen.queryByRole('navigation', { name: 'Điều hướng chính' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Chào mừng trở lại' })).not.toBeInTheDocument();
});

test('signs in and loads dashboard data from the API', async () => {
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/login')) return jsonResponse({ access_token: 'test-token' });
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 1, username: 'manager', role: 'MANAGER' });
    if (url.endsWith('/rooms')) return jsonResponse([{ id: 'r1', currentOccupancy: 2, maxCapacity: 4 }]);
    if (url.endsWith('/student')) return jsonResponse([{ sid: 'SV001' }]);
    if (url.endsWith('/contract')) return jsonResponse([{ is_active: true }]);
    if (url.endsWith('/utility-bill')) return jsonResponse([{ bill_id: 1, is_paid: false, total_amount: 50000 }]);
    return jsonResponse([]);
  });
  window.history.replaceState({}, '', '/#login');

  render(<App />);
  fireEvent.change(await screen.findByLabelText('Tên đăng nhập'), { target: { value: 'manager' } });
  fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));

  expect(await screen.findByRole('heading', { name: 'Bảng điều khiển' })).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:5001/student',
    expect.objectContaining({ headers: expect.any(Headers) }),
  ));
  expect(screen.getByText('Sinh viên lưu trú').parentElement).toHaveTextContent('1');
  expect(localStorage.getItem('ktx_access_token')).toBe('test-token');
});

test('registers a student account through the backend API', async () => {
  global.fetch.mockResolvedValue(jsonResponse({
    message: 'Đăng ký thành công!',
    user: { id: 3, username: 'new.student', role: 'STUDENT' },
  }));
  window.history.replaceState({}, '', '/#register');

  render(<App />);

  fireEvent.change(await screen.findByLabelText('Tên đăng nhập'), { target: { value: 'new.student' } });
  fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'strong-pass-123' } });
  fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu'), { target: { value: 'strong-pass-123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));

  expect(await screen.findByRole('status')).toHaveTextContent('Tạo tài khoản thành công');
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:5001/auth/register', expect.objectContaining({
    method: 'POST',
    body: JSON.stringify({ username: 'new.student', password: 'strong-pass-123' }),
  }));
  expect(localStorage.getItem('ktx_access_token')).toBeNull();
});

test('loads student records in the students module and searches those returned by the API', async () => {
  localStorage.setItem('ktx_access_token', 'test-token');
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 2, username: 'admin', role: 'ADMIN' });
    if (url.endsWith('/student')) return jsonResponse([
      { sid: 'SV001', sname: 'Nguyễn An', email: 'an@example.com', phone: '0900000000', role: 'STUDENT' },
      { sid: 'SV002', sname: 'Trần Bình', email: 'binh@example.com', phone: '0911111111', role: 'STUDENT' },
    ]);
    return jsonResponse([]);
  });
  window.history.replaceState({}, '', '/#students');

  render(<App />);

  expect(await screen.findByText('Nguyễn An')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Tìm sinh viên' }), { target: { value: 'SV002' } });
  await waitFor(() => expect(screen.queryByText('Nguyễn An')).not.toBeInTheDocument());
  expect(screen.getByText('Trần Bình')).toBeInTheDocument();
});

test('shows API failures explicitly on the dashboard', async () => {
  localStorage.setItem('ktx_access_token', 'test-token');
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 2, username: 'admin', role: 'ADMIN' });
    return jsonResponse({ message: 'Database unavailable' }, false, 503);
  });
  window.history.replaceState({}, '', '/#overview');

  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Bảng điều khiển' })).toBeInTheDocument();
  expect(await screen.findByRole('status')).toHaveTextContent(/không thể tải số liệu tổng quan/i);
});
