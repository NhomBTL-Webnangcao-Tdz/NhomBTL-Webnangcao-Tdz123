import { apiBlobRequest, apiRequest } from './client';

const getReceipt = (billId) => apiBlobRequest(`/utility-bill/${billId}/receipt`);

export const billApi = {
  list: () => apiRequest('/utility-bill'),
  create: (bill) => apiRequest('/utility-bill', {
    method: 'POST',
    body: JSON.stringify(bill),
  }),
  createGeneralCharge: (charge) => {
    const body = new FormData();
    body.append('title', charge.title);
    body.append('description', charge.description);
    body.append('roomId', charge.roomId);
    body.append('totalAmount', String(charge.totalAmount));
    body.append('dueDate', charge.dueDate);
    body.append('month', String(charge.month));
    body.append('year', String(charge.year));
    if (charge.receiptImage) body.append('receiptImage', charge.receiptImage);
    return apiRequest('/utility-bill/general', { method: 'POST', body });
  },
  getReceipt,
  update: (id, bill) => apiRequest(`/utility-bill/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bill),
  }),
  updateSharePayment: (billId, studentSid, isPaid) => apiRequest(
    `/utility-bill/${billId}/shares/${encodeURIComponent(studentSid)}`,
    { method: 'PATCH', body: JSON.stringify({ isPaid }) },
  ),
  remindStudent: (billId, studentSid) => apiRequest(
    `/utility-bill/${billId}/shares/${encodeURIComponent(studentSid)}/remind`,
    { method: 'POST' },
  ),
  remove: (id) => apiRequest(`/utility-bill/${id}`, { method: 'DELETE' }),
};
