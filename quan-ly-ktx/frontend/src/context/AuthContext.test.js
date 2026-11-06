import { act, render, screen, waitFor } from '@testing-library/react';
import { TOKEN_KEY } from '../api/client';
import { AuthProvider, useAuth } from './AuthContext';

function jsonResponse(status, payload) {
  return {
    ok: status < 400,
    status,
    headers: { get: () => 'application/json' },
    json: async () => payload,
  };
}

let auth;

function Probe() {
  auth = useAuth();
  return <p>{auth.isReady ? `sẵn sàng:${auth.user?.username || 'khách'}` : 'đang tải'}</p>;
}

const renderProvider = () => render(<AuthProvider><Probe /></AuthProvider>);

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '';
  global.fetch = jest.fn();
});

test('không có token thì sẵn sàng ngay, không gọi API', async () => {
  renderProvider();

  expect(await screen.findByText('sẵn sàng:khách')).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

test('có token hợp lệ thì khôi phục phiên sau khi tải lại trang', async () => {
  localStorage.setItem(TOKEN_KEY, 'token-thu');
  fetch.mockResolvedValue(jsonResponse(200, { username: 'test-sv', role: 'STUDENT' }));

  renderProvider();

  expect(await screen.findByText('sẵn sàng:test-sv')).toBeInTheDocument();
});

test('token bị từ chối lúc mở app thì xóa token, về đăng nhập, báo hết phiên', async () => {
  localStorage.setItem(TOKEN_KEY, 'token-het-han');
  fetch.mockResolvedValue(jsonResponse(401, { message: 'Unauthorized' }));

  renderProvider();

  expect(await screen.findByText('sẵn sàng:khách')).toBeInTheDocument();
  expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  expect(window.location.hash).toBe('#login');
  expect(auth.sessionError).toContain('Phiên đăng nhập đã hết hạn');
});

test('máy chủ lỗi lúc mở app thì báo lỗi, không ghi là hết phiên', async () => {
  localStorage.setItem(TOKEN_KEY, 'token-thu');
  fetch.mockResolvedValue(jsonResponse(500, { message: 'Lỗi hệ thống.' }));

  renderProvider();

  await waitFor(() => expect(auth.sessionError).toContain('máy chủ chưa sẵn sàng'));
  expect(auth.sessionError).not.toContain('hết hạn');
});

test('đăng nhập lưu token rồi tải hồ sơ, đăng xuất xóa cả hai', async () => {
  renderProvider();
  await screen.findByText('sẵn sàng:khách');
  fetch
    .mockResolvedValueOnce(jsonResponse(200, { access_token: 'token-moi' }))
    .mockResolvedValueOnce(jsonResponse(200, { username: 'test-sv', role: 'STUDENT' }));

  await act(async () => { await auth.login({ username: 'test-sv', password: 'test-mk' }); });

  expect(localStorage.getItem(TOKEN_KEY)).toBe('token-moi');
  expect(screen.getByText('sẵn sàng:test-sv')).toBeInTheDocument();

  act(() => auth.logout());

  expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  expect(screen.getByText('sẵn sàng:khách')).toBeInTheDocument();
});

test('tải hồ sơ lỗi sau đăng nhập thì không để lại token', async () => {
  renderProvider();
  await screen.findByText('sẵn sàng:khách');
  fetch
    .mockResolvedValueOnce(jsonResponse(200, { access_token: 'token-moi' }))
    .mockResolvedValueOnce(jsonResponse(500, { message: 'Lỗi hệ thống.' }));

  await act(async () => {
    await expect(auth.login({ username: 'test-sv', password: 'test-mk' })).rejects.toThrow('Lỗi hệ thống.');
  });

  expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
});
