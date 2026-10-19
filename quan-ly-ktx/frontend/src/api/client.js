const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001').replace(/\/$/, '');
const TOKEN_KEY = 'ktx_access_token';

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
    const message = typeof payload === 'string'
      ? payload
      : payload.message || `Yêu cầu thất bại (HTTP ${response.status}).`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return payload;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export { TOKEN_KEY };
