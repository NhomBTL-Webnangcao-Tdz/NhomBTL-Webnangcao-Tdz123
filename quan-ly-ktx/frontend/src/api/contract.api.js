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
  end: (id) => apiRequest(`/contract/${id}/end`, { method: 'PATCH' }),
  renew: (id, end_date) => apiRequest(`/contract/${id}/renew`, {
    method: 'PATCH',
    body: JSON.stringify({ end_date }),
  }),
  liquidate: (id, end_date) => apiRequest(`/contract/${id}/liquidate`, {
    method: 'PATCH',
    body: JSON.stringify(end_date ? { end_date } : {}),
  }),
  remove: (id) => apiRequest(`/contract/${id}`, { method: 'DELETE' }),
};
