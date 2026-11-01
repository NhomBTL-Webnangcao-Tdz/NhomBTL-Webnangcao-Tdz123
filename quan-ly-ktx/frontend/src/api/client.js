const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001').replace(/\/$/, '');
const TOKEN_KEY = 'ktx_access_token';
const SESSION_EXPIRED_MESSAGE = 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.';
const FORBIDDEN_MESSAGE = 'Bạn không có quyền thực hiện thao tác này.';

let unauthorizedHandler = null;

// AuthContext đăng ký hàm này để đăng xuất khi token bị backend từ chối (401).
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const rawMessage = typeof payload === 'string'
      ? payload
      : payload.message || `Yêu cầu thất bại (HTTP ${response.status}).`;
    let message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;

    // 401 khi đã gửi token: phiên hết hạn. 401 khi chưa có token (VD sai mật khẩu) giữ thông báo của backend.
    if (response.status === 401 && token) {
      message = SESSION_EXPIRED_MESSAGE;
      if (unauthorizedHandler) unauthorizedHandler(message);
    } else if (response.status === 403) {
      message = FORBIDDEN_MESSAGE;
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export { TOKEN_KEY };
