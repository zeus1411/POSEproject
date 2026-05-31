import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminChatPanel from './AdminChatPanel';
import { useTheme } from '../../context/ThemeContext';

const AdminShell = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const { isDark } = useTheme();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to shop if not admin
  if (user.role !== 'admin') {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className={`admin-shell min-h-screen flex relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#051C1C] text-white' : 'bg-background text-foreground'}`}>
      {/* 1. Main Gradient Background - Fixed */}
      <div className={`fixed inset-0 z-0 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-b from-[#051C1C] via-[#0a2828] to-[#051C1C]' 
          : 'bg-gradient-to-b from-[#FFFDF0] via-[#E8F6F6] to-[#FFFDF0]'
      }`}></div>

      {/* 2. Wave pattern */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: isDark
            ? `url("data:image/svg+xml,%3Csvg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-opacity='0.5'/%3E%3Cpath d='M0 140 Q 100 90 200 140 T 400 140' fill='none' stroke='%2306b6d4' stroke-width='1' stroke-opacity='0.3'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100' fill='none' stroke='%234682A9' stroke-width='1.5' stroke-opacity='0.25'/%3E%3Cpath d='M0 140 Q 100 90 200 140 T 400 140' fill='none' stroke='%23749BC2' stroke-width='1' stroke-opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: '800px 400px',
          opacity: isDark ? 0.45 : 0.3,
        }}
      ></div>

      {/* 3. Glow orbs */}
      <div className={`fixed top-[10%] left-[-5%] w-[400px] h-[400px] rounded-full z-0 pointer-events-none blur-[100px] transition-colors duration-300 ${
        isDark ? 'bg-emerald-900/15' : 'bg-emerald-200/30'
      }`}></div>
      <div className={`fixed bottom-[15%] right-[-5%] w-[350px] h-[350px] rounded-full z-0 pointer-events-none blur-[90px] transition-colors duration-300 ${
        isDark ? 'bg-cyan-900/15' : 'bg-cyan-200/30'
      }`}></div>

      {/* Admin content with layout stack */}
      <div className="relative z-auto flex w-full">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6 relative">
          {children}
        </main>
        <AdminChatPanel />
      </div>
    </div>
  );
};

export default AdminShell;
