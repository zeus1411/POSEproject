import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Layout from './components/Layout';
import Reports from './pages/admin/Reports';
import Promotions from './pages/admin/Promotions';
import Products from './pages/admin/Products';
import MyOrders from './pages/customer/MyOrders';
import Shop from './pages/customer/Shop';
import ProductDetail from './pages/customer/ProductDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/shop" replace />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="admin/dashboard" element={<Navigate to="/admin/products" replace />} />
            <Route path="admin/products" element={<Products />} />
            <Route path="admin/reports" element={<Reports />} />
            <Route path="admin/promotions" element={<Promotions />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
