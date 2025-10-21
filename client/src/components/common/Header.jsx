import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="header">
      <h1>{isAdmin ? 'Admin Panel' : 'Customer Portal'}</h1>
      <nav>
        <Link to="/">Home</Link>
        {isAdmin ? (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/products">Products</Link>
            <Link to="/admin/reports">Reports</Link>
          </>
        ) : (
          <>
            <Link to="/shop">Shop</Link>
            <Link to="/orders">My Orders</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
