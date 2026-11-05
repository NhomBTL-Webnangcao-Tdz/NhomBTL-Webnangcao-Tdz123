import { apiRequest } from './client';

export const paymentApi = {
  list: (contractId) => apiRequest(`/payments?contractId=${encodeURIComponent(contractId)}`),
  create: (payment) => apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(payment),
  }),
};
