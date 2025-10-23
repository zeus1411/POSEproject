// e:/POSE project/client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/common/Login';
import Register from './pages/common/Register';
import Home from './pages/common/Home';
import Layout from './components/Layout';
import Reports from './pages/admin/Reports';
import Promotions from './pages/admin/Promotions';
import Products from './pages/admin/Products';
import MyOrders from './pages/user/MyOrders';
import Shop from './pages/common/Shop';
import Unauthorized from './pages/common/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/shop" replace />} />
              <Route path="shop" element={<Shop />} />
              <Route path="orders" element={<MyOrders />} />
            </Route>
          </Route>

          {/* Protected admin routes */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="admin" element={<Layout />}>
              <Route index element={<Navigate to="products" replace />} />
              <Route path="products" element={<Products />} />
              <Route path="reports" element={<Reports />} />
              <Route path="promotions" element={<Promotions />} />
            </Route>
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;