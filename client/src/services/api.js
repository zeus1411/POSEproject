import axios from 'axios';

// Trong Docker/production, API se duoc proxy qua Nginx
// Trong development, dung VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache', // ✅ Force no cache
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Server uses cookies, no need to add Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Không log lỗi 401 từ endpoint /auth/me vì đây là hành vi bình thường khi chưa đăng nhập
    const is401FromAuthMe = 
      error.response?.status === 401 && 
      error.config?.url?.includes('/auth/me');
    
    if (!is401FromAuthMe && error.response?.status === 401) {
      localStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

export default api;