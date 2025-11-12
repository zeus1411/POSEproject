import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Quản lý sản phẩm',
      path: '/admin/products',
      icon: Package,
      badge: null,
    },
    {
      name: 'Báo cáo',
      path: '/admin/reports',
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto h-[calc(100vh-64px)] sticky top-16">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight size={18} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          AquaticPose Admin v1.0
        </p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
