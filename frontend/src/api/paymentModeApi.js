import api from './axios';

export const paymentModeApi = {
  getAll: () => api.get('/api/payment-modes'),
};
