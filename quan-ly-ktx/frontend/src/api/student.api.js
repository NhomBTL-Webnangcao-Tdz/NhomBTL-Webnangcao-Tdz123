import { apiRequest } from './client';

export const studentApi = {
  list: () => apiRequest('/student'),
  create: (student) => apiRequest('/student', {
    method: 'POST',
    body: JSON.stringify(student),
  }),
  update: (id, student) => apiRequest(`/student/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(student),
  }),
  remove: (id) => apiRequest(`/student/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
