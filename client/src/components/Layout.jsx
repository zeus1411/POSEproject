import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../redux/slices/authSlice';
import Header from './common/Header';
import Sidebar from './common/Sidebar';
import Footer from './common/Footer';
import Toast from './common/Toast';

// List of public routes that don't require authentication
const publicRoutes = ['/shop', '/product/'];

const isPublicRoute = (path) => {
  return publicRoutes.some(route => path.startsWith(route));
};

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isPublic = isPublicRoute(location.pathname);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(getCurrentUser());
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Redirect to /shop only if trying to access protected routes without authentication
  if (!user && !isPublic) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        {user && <Sidebar />}
        <main className={`flex-1 p-6 overflow-y-auto ${!user ? 'ml-0' : ''}`}>
          <Outlet />
        </main>
      </div>
      <Footer />
      <Toast />
    </div>
  );
};

export default Layout;