import { apiRequest, getApiBaseUrl, TOKEN_KEY } from './client';

function buildPhotos(electricPhoto, waterPhoto) {
  const formData = new FormData();
  formData.append('electricPhoto', electricPhoto);
  formData.append('waterPhoto', waterPhoto);
  return formData;
}

export const meterReadingApi = {
  current: () => apiRequest('/meter-readings/me/current'),
  submit: (electricPhoto, waterPhoto, readings) => {
    const formData = buildPhotos(electricPhoto, waterPhoto);
    formData.append('electricReading', String(readings.electricReading));
    formData.append('waterReading', String(readings.waterReading));
    return apiRequest('/meter-readings/me', { method: 'POST', body: formData });
  },
  list: () => apiRequest('/meter-readings'),
  review: (id, details) => apiRequest(`/meter-readings/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify(details),
  }),
  getPhoto: async (id, meter) => {
    const headers = new Headers();
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${getApiBaseUrl()}/meter-readings/${id}/photo/${meter}`, { headers });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || `Не удалось загрузить фото (HTTP ${response.status}).`);
    }
    return URL.createObjectURL(await response.blob());
  },
  tariff: () => apiRequest('/utility-bill/tariff'),
  updateTariff: (tariff) => apiRequest('/utility-bill/tariff', {
    method: 'PUT',
    body: JSON.stringify(tariff),
  }),
};
