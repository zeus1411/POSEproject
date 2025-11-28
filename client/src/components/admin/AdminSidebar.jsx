import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBagIcon,
  ChartBarIcon,
  CubeIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  HomeModernIcon,
  UsersIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigation = [
    { 
      name: 'Sản phẩm', 
      href: '/admin/products', 
      icon: CubeIcon,
      color: 'from-indigo-500 to-blue-500',
      bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
      iconColor: 'text-indigo-600',
   
    },
    { 
      name: 'Đơn hàng', 
      href: '/admin/orders', 
      icon: ShoppingBagIcon,
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      iconColor: 'text-emerald-600',
      
    },
    { 
      name: 'Khuyến mãi', 
      href: '/admin/promotions', 
      icon: TicketIcon,
      color: 'from-pink-500 to-rose-500',
      bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
      iconColor: 'text-pink-600',
   
    },
    { 
      name: 'Người dùng', 
      href: '/admin/manage-users', 
      icon: UsersIcon,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      iconColor: 'text-amber-600',
   
    },
    { 
      name: 'Thống kê', 
      href: '/admin/statistics', 
      icon: ChartBarIcon,
      color: 'from-purple-500 to-fuchsia-500',
      bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50',
      iconColor: 'text-purple-600',
    
    }
  ];

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/login');
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-100 h-screen shadow-sm">
        {/* Header with Logo */}
        <div className="flex items-center justify-center h-20 px-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500">
              <HomeModernIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800">Admin</span>
          </div>
        </div>
        
        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col py-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`group relative flex items-center p-4 rounded-xl transition-all duration-200 h-24 ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 shadow-md'
                    : 'hover:bg-gray-50 hover:shadow-md'
                }`}
              >
                <div className={`p-3 rounded-lg ${item.bg} mr-4`}>
                  <Icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.count} {item.name === 'Thống kê' ? '' : ''}
                  </div>
                </div>
                {isActive && (
                  <div className="w-1.5 h-8 bg-indigo-600 rounded-l-full"></div>
                )}
              </NavLink>
            );
          })}
        </nav>
        
        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span>Đăng xuất</span>
          </button>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400">
              Phiên bản 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
