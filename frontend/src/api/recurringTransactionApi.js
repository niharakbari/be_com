import api from './axios';

export const recurringTransactionApi = {
  getAll: (params) => api.get('/recurring-transactions', { params }),
  getById: (id) => api.get(`/recurring-transactions/${id}`),
  create: (data) => api.post('/recurring-transactions', data),
  update: (id, data) => api.patch(`/recurring-transactions/${id}`, data),
  delete: (id) => api.delete(`/recurring-transactions/${id}`),
  activate: (id) => api.patch(`/recurring-transactions/${id}/activate`),
  deactivate: (id) => api.patch(`/recurring-transactions/${id}/deactivate`)
};
