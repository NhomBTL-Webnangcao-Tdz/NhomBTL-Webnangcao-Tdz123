import { apiRequest } from './client';

export const roomApi = {
  list: () => apiRequest('/rooms'),
  residents: (id) => apiRequest(`/rooms/${encodeURIComponent(id)}/residents`),
  updatePrices: (rooms) => apiRequest('/rooms/prices', {
    method: 'PATCH',
    body: JSON.stringify({ rooms }),
  }),
  create: (room) => apiRequest('/rooms', { method: 'POST', body: JSON.stringify(room) }),
  update: (id, room) => apiRequest(`/rooms/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(room),
  }),
  remove: (id) => apiRequest(`/rooms/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
