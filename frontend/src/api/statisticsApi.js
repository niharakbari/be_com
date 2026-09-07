import api from './axios';

export const statisticsApi = {
  getStatistics: (params) => api.get('/statistics', { params }),
  getBreakdown: (params) => api.get('/statistics/breakdown', { params })
};
