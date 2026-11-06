import { apiRequest, setUnauthorizedHandler, TOKEN_KEY } from './client';

function response(status, payload) {
  return {
    ok: status < 400,
    status,
    headers: { get: () => 'application/json' },
    json: async () => payload,
  };
}

let onUnauthorized;

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
  onUnauthorized = jest.fn();
  setUnauthorizedHandler(onUnauthorized);
});

afterEach(() => setUnauthorizedHandler(null));

test('gửi kèm token và Content-Type khi có body', async () => {
  localStorage.setItem(TOKEN_KEY, 'token-thu');
  fetch.mockResolvedValue(response(200, { ok: true }));

  await expect(apiRequest('/rooms', { method: 'POST', body: '{}' })).resolves.toEqual({ ok: true });

  const headers = fetch.mock.calls[0][1].headers;
  expect(headers.get('Authorization')).toBe('Bearer token-thu');
  expect(headers.get('Content-Type')).toBe('application/json');
});

test('chưa đăng nhập thì không gửi header Authorization', async () => {
  fetch.mockResolvedValue(response(200, []));

  await apiRequest('/rooms');

  expect(fetch.mock.calls[0][1].headers.has('Authorization')).toBe(false);
});

test('401 khi có token: báo hết phiên và gọi xử lý đăng xuất', async () => {
  localStorage.setItem(TOKEN_KEY, 'token-het-han');
  fetch.mockResolvedValue(response(401, { message: 'Unauthorized' }));

  await expect(apiRequest('/rooms')).rejects.toMatchObject({
    status: 401,
    message: expect.stringContaining('Phiên đăng nhập đã hết hạn'),
  });
  expect(onUnauthorized).toHaveBeenCalledTimes(1);
});

test('401 khi chưa có token (sai mật khẩu): giữ thông báo backend, không đăng xuất', async () => {
  fetch.mockResolvedValue(response(401, { message: 'Username hoặc mật khẩu không đúng.' }));

  await expect(apiRequest('/auth/login', { method: 'POST', body: '{}' }))
    .rejects.toThrow('Username hoặc mật khẩu không đúng.');
  expect(onUnauthorized).not.toHaveBeenCalled();
});

test('403 hiện thông báo tiếng Việt, giữ phiên', async () => {
  localStorage.setItem(TOKEN_KEY, 'token-thu');
  fetch.mockResolvedValue(response(403, { message: 'Forbidden resource' }));

  await expect(apiRequest('/users')).rejects.toThrow('Bạn không có quyền thực hiện thao tác này.');
  expect(onUnauthorized).not.toHaveBeenCalled();
});

test('429 giữ thông báo chờ của backend', async () => {
  fetch.mockResolvedValue(response(429, { message: 'Vui lòng thử lại sau 15 phút.' }));

  await expect(apiRequest('/auth/login', { method: 'POST', body: '{}' }))
    .rejects.toMatchObject({ status: 429, message: 'Vui lòng thử lại sau 15 phút.' });
});

test('lỗi validation dạng mảng được nối thành một câu', async () => {
  fetch.mockResolvedValue(response(400, { message: ['Thiếu tên', 'Thiếu email'] }));

  await expect(apiRequest('/student')).rejects.toThrow('Thiếu tên, Thiếu email');
});

test('mất kết nối thì đẩy lỗi ra cho trang xử lý', async () => {
  fetch.mockRejectedValue(new TypeError('Failed to fetch'));

  await expect(apiRequest('/rooms')).rejects.toThrow('Failed to fetch');
});
