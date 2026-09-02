import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: Interceptor to handle 401s and refresh token automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet, and it's not the login/refresh endpoint
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {}, { withCredentials: true });
        
        if (res.data?.data?.accessToken) {
          localStorage.setItem('accessToken', res.data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed/expired
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // Let React Router's <ProtectedRoute> handle the redirect gracefully
        // by returning Promise.reject, which sets user to null in AuthContext
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
