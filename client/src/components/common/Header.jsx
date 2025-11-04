// src/components/common/Header.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { UserCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import MiniCart from './MiniCart';
import ConfirmDialog from './ConfirmDialog';
import { fetchCart } from '../../redux/slices/cartSlice';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { summary } = useSelector((state) => state.cart);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    await dispatch(logout());
    setIsMenuOpen(false);
    setShowLogoutConfirm(false);
    navigate('/shop');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const goToProfile = () => {
    setIsMenuOpen(false);
    navigate('/profile');
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <ShoppingCartIcon className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  POSE Shop
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {isAdmin ? (
                <>
                  <Link to="/admin/products" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
                    Quản lý sản phẩm
                  </Link>
                  <Link to="/admin/promotions" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
                    Khuyến mãi
                  </Link>
                  <Link to="/admin/reports" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
                    Báo cáo
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/shop" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
                    Cửa hàng
                  </Link>
                  <Link to="/orders" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
                    Đơn hàng của tôi
                  </Link>
                </>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Mini Cart Toggle */}
                  <button
                    onClick={() => setIsMiniCartOpen(true)}
                    className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    aria-label="Giỏ hàng"
                  >
                    <ShoppingCartIcon className="h-6 w-6" />
                    {summary?.totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {summary.totalItems > 99 ? '99+' : summary.totalItems}
                      </span>
                    )}
                  </button>

                  {/* Avatar + dropdown */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsMenuOpen((s) => !s); }}
                      className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-50 focus:outline-none"
                      aria-haspopup="true"
                      aria-expanded={isMenuOpen}
                    >
                      <UserCircleIcon className="h-8 w-8 text-gray-400" />
                      <span className="hidden sm:inline text-sm font-medium text-gray-700">{user.username}</span>
                    </button>

                    {/* Dropdown */}
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
                        <button
                          onClick={goToProfile}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                        >
                          Manage Personal Information
                        </button>

                        <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          My Orders
                        </Link>

                        <div className="border-t my-1" />

                        <button
                          onClick={handleLogoutClick}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg hover:from-primary-700 hover:to-purple-700 transition shadow-md hover:shadow-lg">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mini Cart Sidebar */}
      <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        isDangerous={true}
      />
    </>
  );
};

export default Header;