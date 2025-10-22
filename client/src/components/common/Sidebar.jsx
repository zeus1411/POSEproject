import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <aside className="sidebar">
      {isAdmin ? (
        <ul>
          <li><Link to="/admin/dashboard">Dashboard</Link></li>
          <li><Link to="/admin/products">Manage Products</Link></li>
          <li><Link to="/admin/reports">Reports</Link></li>
          <li><Link to="/admin/promotions">Promotions</Link></li>
        </ul>
      ) : (
        <ul>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/orders">My Orders</Link></li>
        </ul>
      )}
    </aside>
  );
};

export default Sidebar;
