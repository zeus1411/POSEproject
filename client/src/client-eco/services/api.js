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
    // 1. Lấy ra URL của request vừa bị lỗi
    const requestUrl = error.config?.url || '';

    // 🔥 CẢI TIẾN: Chặt đứt toàn bộ phần tham số chống cache (?_t=...) trước khi so sánh chuỗi
    const cleanUrl = requestUrl.split('?')[0];

    // 2. 🔥 DANH SÁCH WHITE-LIST: Dùng .includes() để bao quát toàn bộ Endpoint công khai
    const isPublicEndpoint = 
      cleanUrl.includes('/auth/me') ||
      cleanUrl.includes('/ai/chat/session') ||
      cleanUrl.includes('/blogs/public') ||
      cleanUrl.includes('/blog-categories') || 
      cleanUrl.includes('/tags') ||
      cleanUrl.includes('/blog-tags') ||
      cleanUrl.includes('/blog-interactions/status');
    
    // 3. Nếu lỗi 401 thuộc danh sách công khai trên thì KHÔNG được phép redirect, cho phép đi tiếp
    if (error.response?.status === 401 && isPublicEndpoint) {
      return Promise.reject(error);
    }

    // 4. Nếu lỗi 401 nằm ngoài danh sách công khai (ví dụ: vào trang cá nhân, giỏ hàng, thanh toán...) thì bắt đăng nhập lại
    if (error.response?.status === 401 && !isPublicEndpoint) {
      // Xóa thông tin user khỏi localStorage
      localStorage.removeItem('user');
      
      // Chỉ hiển thị toast và redirect 1 lần
      if (!isRedirecting) {
        isRedirecting = true;
        
        const errorMessage = error.response?.data?.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục!';

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
