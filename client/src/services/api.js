import axios from 'axios';
import { toast } from 'react-toastify';

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

// ✅ Biến flag để tránh hiển thị nhiều toast cùng lúc
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Không log lỗi 401 từ endpoint /auth/me vì đây là hành vi bình thường khi chưa đăng nhập
    const is401FromAuthMe = 
      error.response?.status === 401 && 
      error.config?.url?.includes('/auth/me');
    
    // ✅ Xử lý token hết hạn hoặc không hợp lệ
    if (!is401FromAuthMe && error.response?.status === 401) {
      // Xóa thông tin user khỏi localStorage
      localStorage.removeItem('user');
      
      // ✅ Chỉ hiển thị toast và redirect 1 lần
      if (!isRedirecting) {
        isRedirecting = true;
        
        // Lấy message từ backend hoặc dùng message mặc định
        const errorMessage = error.response?.data?.message || 
                            'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục!';
        
        // Hiển thị thông báo
        toast.warning(errorMessage, {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClose: () => {
            // ✅ Redirect về login sau khi đóng toast (hoặc sau 3s)
            const currentPath = window.location.pathname;
            
            // Không redirect nếu đã ở trang login
            if (currentPath !== '/login') {
              // Lưu đường dẫn hiện tại để redirect lại sau khi login
              const redirectUrl = encodeURIComponent(currentPath + window.location.search);
              window.location.href = `/login?redirect=${redirectUrl}`;
            }
            
            // Reset flag sau khi redirect
            setTimeout(() => {
              isRedirecting = false;
            }, 1000);
          }
        });
        
        // ✅ Backup: Tự động redirect sau 3.5s (phòng trường hợp user không đóng toast)
        setTimeout(() => {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && isRedirecting) {
            const redirectUrl = encodeURIComponent(currentPath + window.location.search);
            window.location.href = `/login?redirect=${redirectUrl}`;
            isRedirecting = false;
          }
        }, 3500);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;