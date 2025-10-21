import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './common/Header';
import Sidebar from './common/Sidebar';
import Footer from './common/Footer';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="content">
          <Outlet /> {/* This renders the matched child route */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
