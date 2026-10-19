import { apiRequest } from './client';

export const notificationApi = {
  list: () => apiRequest('/notifications/me'),
  markRead: (id) => apiRequest(`/notifications/me/${encodeURIComponent(id)}/read`, { method: 'PATCH' }),
};
