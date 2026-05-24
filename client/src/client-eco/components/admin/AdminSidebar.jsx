import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ShoppingBagIcon,
  ChartBarIcon,
  CubeIcon,
  HomeModernIcon,
  UsersIcon,
  TicketIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  NewspaperIcon 
} from '@heroicons/react/24/outline';
import { FileClock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { isDark } = useTheme();
  
  const navigation = [
    { 
      name: 'Sản phẩm', 
      href: '/admin/products', 
      icon: CubeIcon,
      subtitle: 'Quản lý kho hàng'
    },
    { 
      name: 'Đơn hàng', 
      href: '/admin/orders', 
      icon: ShoppingBagIcon,
      subtitle: 'Đơn đặt hàng'
    },
    { 
      name: 'Khuyến mãi', 
      href: '/admin/promotions', 
      icon: TicketIcon,
      subtitle: 'Mã giảm giá'
    },
    { 
      name: 'Người dùng', 
      href: '/admin/manage-users', 
      icon: UsersIcon,
      subtitle: 'Khách hàng & Staff'
    },
    { 
      name: 'Thống kê', 
      href: '/admin/statistics', 
      icon: ChartBarIcon,
      subtitle: 'Báo cáo doanh thu'
    },
    { 
      name: 'Danh mục blog',
      href: '/admin/blog-categories',
      icon: DocumentTextIcon,
      subtitle: 'Danh mục bài viết'
    },
    { 
      name: 'Thẻ blog',
      href: '/admin/tags',
      icon: TicketIcon,
      subtitle: 'Từ khóa bài viết'
    },
    { 
      name: 'Danh sách bài viết',
      href: '/admin/blogs',
      icon: NewspaperIcon,
      subtitle: 'Danh sách bài viết'
    },
    {
      name: 'Bài viết chờ duyệt',
      href: '/admin/blogs/pending',
      icon: FileClock,
      subtitle: 'Duyệt bài viết'
    },
    {
      name: 'Xem trang blog',
      href: '/blogs',
      icon: ArrowTopRightOnSquareIcon,
      subtitle: 'Mở trang blog người dùng'
    }
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0 z-20">
      <div className={`flex flex-col w-66 h-screen shadow-2xl transition-all duration-300 border-r ${
        isDark 
          ? 'bg-[#062323]/90 backdrop-blur-md border-white/10 text-white' 
          : 'bg-[#FFFDF0]/95 backdrop-blur-md border-water/30 text-foreground'
      }`}>
        {/* Header with Logo */}
        <div className={`flex items-center justify-center h-20 px-6 border-b transition-colors duration-300 ${
          isDark ? 'border-white/10' : 'border-water/20'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl shadow-lg transition-all ${
              isDark 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-950/20' 
                : 'bg-gradient-to-r from-primary to-water shadow-water/20'
            }`}>
              <HomeModernIcon className="h-5 w-5 text-white" />
            </div>
            <span className={`text-lg font-black tracking-wide ${
              isDark 
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text' 
                : 'bg-gradient-to-r from-primary to-water text-transparent bg-clip-text'
            }`}>
              Aquatic Admin
            </span>
          </div>
        </div>
        
        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto flex flex-col py-6 px-4 space-y-2 custom-scrollbar">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            // Dynamic theme class calculations
            const linkClass = isActive
              ? (isDark
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-950/10'
                  : 'bg-water/15 border border-water/35 text-primary shadow-md shadow-water/5')
              : (isDark
                  ? 'text-gray-400 border border-transparent hover:bg-white/5 hover:text-white'
                  : 'text-gray-600 border border-transparent hover:bg-water/5 hover:text-primary');

            const iconContainerClass = isActive
              ? (isDark ? 'bg-emerald-500/30' : 'bg-water/25')
              : (isDark ? 'bg-white/5 group-hover:bg-white/10' : 'bg-water/5 group-hover:bg-water/10');

            const iconClass = isActive
              ? (isDark ? 'text-emerald-400' : 'text-primary')
              : (isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-primary');

            const textClass = isActive
              ? (isDark ? 'font-bold text-white' : 'font-bold text-primary')
              : (isDark ? 'text-gray-700 group-hover:text-primary' : 'text-gray-700 group-hover:text-primary');

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`group relative flex items-center p-3.5 rounded-2xl transition-all duration-250 min-h-[68px] ${linkClass}`}
              >
                <div className={`p-2.5 rounded-xl mr-3.5 transition-colors duration-250 ${iconContainerClass}`}>
                  <Icon className={`h-5 w-5 transition-colors duration-250 ${iconClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold truncate transition-colors duration-250 ${
                    isActive ? (isDark ? 'text-emerald-400' : 'text-primary') : (isDark ? 'text-gray-200' : 'text-gray-800')
                  }`}>
                    {item.name}
                  </div>
                  <div className={`text-[10px] transition-colors duration-250 ${
                    isActive ? (isDark ? 'text-emerald-500/80' : 'text-primary/70') : 'text-gray-400'
                  }`}>
                    {item.subtitle}
                  </div>
                </div>
                {isActive && (
                  <div className={`w-1 h-6 rounded-full absolute right-2 ${
                    isDark ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-primary shadow-[0_0_8px_rgba(70,130,169,0.5)]'
                  }`}></div>
                )}
              </NavLink>
            );
          })}
        </nav>
        
        {/* Bottom Section */}
        <div className={`p-5 border-t text-center transition-colors duration-300 ${
          isDark ? 'border-white/10' : 'border-water/20'
        }`}>
          <p className="text-[11px] font-mono tracking-wider text-gray-400 uppercase">
            Aquatic Portal v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
