import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  TagIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const adminMenuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Squares2X2Icon },
    { name: 'Quản lý sản phẩm', path: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Khuyến mãi', path: '/admin/promotions', icon: TagIcon },
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
