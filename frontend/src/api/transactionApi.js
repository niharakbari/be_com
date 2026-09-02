import api from './axios';

export const transactionApi = {
  getAll: (params) => api.get('/transactions', { params }), // supports search, filter, pagination
  getSummary: (params) => api.get('/transactions/summary', { params }), // for dashboard stats
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.patch(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`)
};
