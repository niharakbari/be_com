import api from './axios';

export const categoryApi = {
  getAll: () => api.get('/catagories'),
  create: (data) => api.post('/catagories', data),
  update: (id, data) => api.patch(`/catagories/${id}`, data),
  delete: (id) => api.delete(`/catagories/${id}`),
  getUsage: (id) => api.get(`/catagories/${id}/usage`),
  reassignAndDelete: (id, newCategoryId) => api.post(`/catagories/${id}/reassign`, { newCategoryId })
};
