import { apiRequest } from './client';

export const userApi = {
  list: () => apiRequest('/users'),
  createManager: (account) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(account),
  }),
  updateRole: (id, role) => apiRequest(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  }),
};
