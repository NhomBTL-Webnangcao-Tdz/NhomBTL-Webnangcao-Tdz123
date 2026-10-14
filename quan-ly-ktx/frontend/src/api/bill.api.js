import { apiRequest } from './client';

export const billApi = {
  list: () => apiRequest('/utility-bill'),
  create: (bill) => apiRequest('/utility-bill', {
    method: 'POST',
    body: JSON.stringify(bill),
  }),
  update: (id, bill) => apiRequest(`/utility-bill/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bill),
  }),
  remove: (id) => apiRequest(`/utility-bill/${id}`, { method: 'DELETE' }),
};
