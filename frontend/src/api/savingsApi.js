import api from './axios';

export const savingsApi = {
  getAll: (params) => api.get('/monthly-savings', { params }),
  create: (data) => api.post('/monthly-savings', data),
  update: (id, data) => api.patch(`/monthly-savings/${id}`, data),
  delete: (id) => api.delete(`/monthly-savings/${id}`)
};
