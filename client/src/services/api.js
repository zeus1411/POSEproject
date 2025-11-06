import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
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