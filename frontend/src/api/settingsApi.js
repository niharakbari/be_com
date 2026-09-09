import api from './axios';

export const settingsApi = {
  getSettings: () => api.get('/user-settings'),
  updateSettings: (data) => api.patch('/user-settings', data)
};
