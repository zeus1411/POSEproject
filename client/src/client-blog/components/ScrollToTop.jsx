import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Mỗi khi pathname thay đổi, tự động cuộn lên x=0, y=0 mượt mà
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Nếu muốn cuộn ngay lập tức thì đổi thành 'auto'
    });
  }, [pathname]);

  // Component này chạy ngầm, không render ra giao diện
  return null; 
};

export default ScrollToTop;