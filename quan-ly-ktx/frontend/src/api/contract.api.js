import { apiRequest } from './client';

export const contractApi = {
  list: () => apiRequest('/contract'),
  create: (contract) => apiRequest('/contract', {
    method: 'POST',
    body: JSON.stringify(contract),
  }),
  update: (id, contract) => apiRequest(`/contract/${id}`, {
    method: 'PUT',
    body: JSON.stringify(contract),
  }),
  remove: (id) => apiRequest(`/contract/${id}`, { method: 'DELETE' }),
};
