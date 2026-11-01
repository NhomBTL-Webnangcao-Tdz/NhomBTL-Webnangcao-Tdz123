import { apiBlobRequest, apiRequest } from './client';

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
  getPhoto: (id, meter) => apiBlobRequest(`/meter-readings/${id}/photo/${meter}`),
  tariff: () => apiRequest('/utility-bill/tariff'),
  updateTariff: (tariff) => apiRequest('/utility-bill/tariff', {
    method: 'PUT',
    body: JSON.stringify(tariff),
  }),
};
