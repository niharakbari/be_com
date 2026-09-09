import api from './axios';

export const budgetApi = {
  getAll: (params) => api.get('/budgets', { params }),
  getById: (id) => api.get(`/budgets/${id}`),
  getUsage: (params) => api.get('/budgets/usage', { params }),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.patch(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  clone: (data) => api.post('/budgets/clone', data)
};
