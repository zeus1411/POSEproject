import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Reports from './pages/admin/Reports';
import Promotions from './pages/admin/Promotions';
import Products from './pages/admin/Products';
import MyOrders from './pages/customer/MyOrders';
import Shop from './pages/customer/Shop';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/shop" replace />} /> {/* Default to shop */}
          <Route path="shop" element={<Shop />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="admin/dashboard" element={<Navigate to="/admin/products" replace />} /> {/* Default admin page */}
          <Route path="admin/products" element={<Products />} />
          <Route path="admin/reports" element={<Reports />} />
          <Route path="admin/promotions" element={<Promotions />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;