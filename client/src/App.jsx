import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './redux/store';
import Layout from './components/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { SocketProvider } from './context/SocketContext';
import Home from './pages/common/Home';
import Statistics from './pages/admin/Statistics';
import Products from './pages/admin/Products';
import ManageUsers from './pages/admin/ManageUsers';
import MyOrders from './pages/customer/MyOrders';
import OrderDetail from './pages/customer/OrderDetail';
import Shop from './pages/customer/Shop';
import ProductDetail from "./pages/product/ProductDetail";
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Checkout from './pages/customer/Checkout';
import ProfilePage from './pages/customer/ProfilePage';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminLayout from './components/admin/AdminLayout';


function App() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <Router>
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
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="admin/dashboard" element={<Navigate to="/admin/products" replace />} />
              <Route path="admin/products" element={<Products />} />
              <Route path="admin/manage-users" element={<ManageUsers />} />
              <Route path="admin/statistics" element={<Statistics />} />
              <Route path="admin/orders" element={<AdminOrders />} />
              <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
              <Route path="/admin/my-orders" element={<AdminLayout> <MyOrders /> </AdminLayout>} />
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
          theme="light"
        />
        </Router>
      </SocketProvider>
    </Provider>
  );
}

export default App;