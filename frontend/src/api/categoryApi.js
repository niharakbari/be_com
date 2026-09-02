import api from './axios';

export const categoryApi = {
  getAll: () => api.get('/catagories'),
  create: (data) => api.post('/catagories', data),
  update: (id, data) => api.patch(`/catagories/${id}`, data),
  delete: (id) => api.delete(`/catagories/${id}`)
};
