import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Menu, LogOut, User, Bell } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import ConfirmDialog from './ConfirmDialog';
const AdminHeader = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await dispatch(logout());
    navigate('/shop');
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AquaticPose Admin</h1>
              <p className="text-xs text-gray-500">Quản lý hệ thống</p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.username}</span>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition"
                    >
                      <User size={16} />
                      Hồ sơ cá nhân
                    </button>
                    <button
                      onClick={() => {
                        setShowLogoutConfirm(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        isDangerous={true}
      />
    </>
  );
};

export default AdminHeader;
