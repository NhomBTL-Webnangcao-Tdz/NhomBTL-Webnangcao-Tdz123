import { apiRequest } from './client';

export const authApi = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (credentials) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  profile: () => apiRequest('/auth/profile'),
  changePassword: (details) => apiRequest('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify(details),
  }),
};
