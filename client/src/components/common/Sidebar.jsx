import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  // ✅ FIX: Check user role instead of URL path
  const isAdmin = user?.role === 'admin';

  const adminMenuItems = [
    { name: 'Quản lý sản phẩm', path: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Quản lý đơn hàng', path: '/admin/orders', icon: ClipboardDocumentListIcon },
    { name: 'Quản lý người dùng', path: '/admin/users', icon: UserGroupIcon },
    { name: 'Báo cáo', path: '/admin/reports', icon: ChartBarIcon },
  ];

  const customerMenuItems = [
    { name: 'Cửa hàng', path: '/shop', icon: ShoppingBagIcon },
    { name: 'Đơn hàng của tôi', path: '/orders', icon: ClipboardDocumentListIcon },
  ];

  const menuItems = isAdmin ? adminMenuItems : customerMenuItems;

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
