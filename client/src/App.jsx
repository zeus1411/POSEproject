import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './shared/redux/store';
import Layout from '../src/client-eco/components/Layout.jsx';
import ProtectedRoute from '../src/client-eco/components/common/ProtectedRoute';
import { SocketProvider } from '../src/client-eco/context/SocketContext';
import Home from '../src/client-eco/pages/common/Home';
import Statistics from '../src/client-eco/pages/admin/Statistics';
import Products from '../src/client-eco/pages/admin/Products';
import ManageUsers from '../src/client-eco/pages/admin/ManageUsers';
import MyOrders from '../src/client-eco/pages/customer/MyOrders';
import OrderDetail from '../src/client-eco/pages/customer/OrderDetail';
import Shop from '../src/client-eco/pages/customer/Shop';
import ProductDetail from "../src/client-eco/pages/product/ProductDetail";
import Login from '../src/client-eco/pages/auth/Login';
import Register from '../src/client-eco/pages/auth/Register';
import ForgotPassword from '../src/client-eco/pages/auth/ForgotPassword';
import Checkout from '../src/client-eco/pages/customer/Checkout';
import ProfilePage from '../src/client-eco/pages/customer/ProfilePage';
import AdminOrders from '../src/client-eco/pages/admin/Orders';
import AdminOrderDetail from '../src/client-eco/pages/admin/AdminOrderDetail';
import AdminLayout from '../src/client-eco/components/admin/AdminLayout';
import AdminPromotions from '../src/client-eco/pages/admin/Promotions';

// Blog management pages
import AdminBlogCategories from './client-blog/pages/admin/BlogCategories';
import AdminBlogTags from './client-blog/pages/admin/BlogTags';
import BlogEditor from './client-blog/pages/admin/BlogEditor';
import BlogList from './client-blog/pages/admin/BlogList';
import PendingBlogList from './client-blog/pages/admin/PendingBlogList.jsx';

// Public blog listing page
import BlogListPage from './client-blog/pages/common/BlogListPage';
import BlogDetailPage from './client-blog/pages/common/BlogDetailPage';
import CreateUserBlog from './client-blog/pages/common/CreateUserBlog.jsx';

// Customer blog management page
import MyBlogs from './client-blog/pages/customer/MyBlogs.jsx';

import ScrollToTop from './client-blog/components/ScrollToTop.jsx';
import { useTheme } from './client-eco/context/ThemeContext.jsx';

function App() {
  const { theme } = useTheme();

  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop />
        <SocketProvider>
          <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Main Routes */}
          <Route path="/" element={<Layout />}>
            {/* Home page as landing page */}
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetail />} />
            
            {/* Protected Customer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="/my-blogs" element={<MyBlogs />} />
              <Route path="/my-blogs/preview/:id" element={<BlogDetailPage isAdminPreview />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              {/* Ecom management routes */}
              <Route path="admin/dashboard" element={<Navigate to="/admin/products" replace />} />
              <Route path="admin/products" element={<Products />} />
              <Route path="admin/manage-users" element={<ManageUsers />} />
              <Route path="admin/statistics" element={<Statistics />} />
              <Route path="admin/orders" element={<AdminOrders />} />
              <Route path="admin/orders/:id" element={<AdminOrderDetail />} />
              <Route path="admin/my-orders" element={<AdminLayout> <MyOrders /> </AdminLayout>} />
              <Route path="admin/promotions" element={<AdminPromotions />} />

              {/* Blog management routes */}
              <Route path="admin/blog-categories" element={<AdminBlogCategories />} />
              <Route path="admin/tags" element={<AdminBlogTags />} />
              <Route path="admin/blogs/create" element={<BlogEditor />} />
              <Route path="admin/blogs/edit/:id" element={<BlogEditor />} />
              <Route path="admin/blogs" element={<BlogList />} />
              <Route path="admin/blogs/pending" element={<PendingBlogList />} />
              <Route path="admin/blogs/preview/:id" element={<BlogDetailPage isAdminPreview />} />
            </Route>

            {/* PUBLIC BLOG ROUTES */}
            <Route path="/blogs" element={<BlogListPage />} />
            <Route path="/blogs/:slug" element={<BlogDetailPage />} />
            <Route element={<ProtectedRoute />}>
              <Route
                path="/blogs/create"
                element={<CreateUserBlog />}
              />
              <Route
                path="/blogs/edit/:id"
                element={<CreateUserBlog />}
              />
            </Route>
          </Route>      

          {/* Catch-all: mọi đường dẫn lạ → /shop */}
          <Route path="*" element={<Navigate to="/shop" replace />} />
        </Routes>
        
        {/* Toast Container - Hiển thị tất cả thông báo */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme}
          icon={({ type }) => {
            if (type === 'error') {
              return (
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              );
            }
            return undefined;
          }}
        />
        </SocketProvider>
      </Router>
    </Provider>
  );
}

export default App;
