import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CubeIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Tổng quan', href: '/admin', icon: HomeIcon },
    { name: 'Cửa hàng', href: '/shop', icon: ShoppingBagIcon },
    { name: 'Sản phẩm', href: '/admin/products', icon: CubeIcon },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingBagIcon },
    { name: 'Đơn hàng của tôi', href: '/admin/my-orders', icon: ShoppingBagIcon },
    { name: 'Quản lý người dùng', href: '/admin/manage-users', icon: UserGroupIcon },
    { name: 'Xem Thống Kê', href: '/admin/statistics', icon: ChartBarIcon },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-gray-800">Quản trị viên</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon 
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} 
                    aria-hidden="true" 
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </nav>
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                Quản trị viên
              </p>
              <p className="text-xs text-gray-500 truncate">
                admin@example.com
              </p>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
