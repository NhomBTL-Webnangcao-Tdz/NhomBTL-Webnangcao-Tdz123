import { apiRequest } from './client';

export const residenceApi = {
  list: () => apiRequest('/residence-requests'),
  approve: (id, details) => apiRequest(`/residence-requests/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(details),
  }),
  reject: (id, reviewNote) => apiRequest(`/residence-requests/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reviewNote }),
  }),
};
