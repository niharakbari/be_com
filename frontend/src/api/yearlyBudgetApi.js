import api from './axios';

export const yearlyBudgetApi = {
  getAll: (params) => api.get('/yearly-budgets', { params }),
  getById: (id) => api.get(`/yearly-budgets/${id}`),
  getUsage: (params) => api.get('/yearly-budgets/usage', { params }),
  create: (data) => api.post('/yearly-budgets', data),
  update: (id, data) => api.patch(`/yearly-budgets/${id}`, data),
  delete: (id) => api.delete(`/yearly-budgets/${id}`)
};
