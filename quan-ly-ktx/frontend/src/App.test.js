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

test('renders the dashboard shell and requires authentication for management pages', async () => {
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Vui lòng đăng nhập' })).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: 'Điều hướng chính' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Chào mừng trở lại' })).toBeInTheDocument();
  expect(screen.getByRole('contentinfo')).toHaveTextContent('KTX Care');
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

  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: 'Đăng nhập', exact: true }));
  fireEvent.change(await screen.findByLabelText('Tên đăng nhập'), { target: { value: 'manager' } });
  fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));

  expect(await screen.findByRole('heading', { name: 'Bảng điều khiển' })).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:5000/student',
    expect.objectContaining({ headers: expect.any(Headers) }),
  ));
  expect(screen.getByText('Sinh viên lưu trú').parentElement).toHaveTextContent('1');
  expect(localStorage.getItem('ktx_access_token')).toBe('test-token');
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
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Bảng điều khiển' })).toBeInTheDocument();
  expect(await screen.findByRole('status')).toHaveTextContent(/không thể tải số liệu tổng quan/i);
});
