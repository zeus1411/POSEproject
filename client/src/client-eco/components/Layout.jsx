import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../redux/slices/authSlice';
import Header from './common/Header';
import Footer from './common/Footer';
import Toast from './common/Toast';
import ChatBubble from './common/ChatBubble';
import AiChatBubble from './common/AiChatBubble';
import { ChatDockProvider } from '../context/ChatDockContext';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const pathname = location.pathname !== '/' ? location.pathname.replace(/\/+$/, '') : location.pathname;
  const showFooter =
    pathname === '/' ||
    pathname === '/shop' ||
    pathname.startsWith('/product/') ||
    pathname === '/blogs' ||
    (pathname.startsWith('/blogs/') && !pathname.startsWith('/blogs/create') && !pathname.startsWith('/blogs/edit/')) ||
    pathname.startsWith('/my-blogs/preview/');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(getCurrentUser()).unwrap();
      } catch (error) {
        // 401 khi chưa đăng nhập là bình thường, không cần xử lý
        // User sẽ ở trạng thái null và có thể xem shop tự do
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex flex-1 pt-16">
        <main className="w-full">
          <Outlet />
        </main>
      </div>
      {showFooter && <Footer />}
      <Toast />
      <ChatDockProvider>
        <ChatBubble />
        <AiChatBubble />
      </ChatDockProvider>
    </div>
  );
};

export default Layout;
