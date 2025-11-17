import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Layout from './components/Layout';
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
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Main Routes */}
          <Route path="/" element={<Layout />}>
            {/* Điểm quan trọng: index -> /shop */}
            <Route index element={<Navigate to="/shop" replace />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="admin/dashboard" element={<Navigate to="/admin/products" replace />} />
            <Route path="admin/products" element={<Products />} />
            <Route path="admin/manage-users" element={<ManageUsers />} />
            <Route path="admin/statistics" element={<Statistics />} />
            <Route path="admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
            <Route path="/admin/my-orders" element={<AdminLayout> <MyOrders /> </AdminLayout>} />
        </Route>

          {/* Catch-all: mọi đường dẫn lạ → /shop */}
          <Route path="*" element={<Navigate to="/shop" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;