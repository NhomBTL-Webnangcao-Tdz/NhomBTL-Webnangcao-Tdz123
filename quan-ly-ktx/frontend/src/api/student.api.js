import { apiRequest } from './client';

export const studentApi = {
  portal: () => apiRequest('/student/me/portal'),
  saveMyProfile: (profile) => apiRequest('/student/me/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  }),
  requestResidence: (request) => apiRequest('/student/me/residence-request', {
    method: 'POST',
    body: JSON.stringify(request),
  }),
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
