// src/components/common/Header.jsx
<<<<<<< HEAD
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { UserCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import MiniCart from './MiniCart';
=======
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCartIcon, UserCircleIcon } from '@heroicons/react/24/outline';

>>>>>>> main
import { fetchCart } from '../../redux/slices/cartSlice';
import { logout as logoutAction } from '../../redux/slices/authSlice';
import MiniCart from './MiniCart';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const { summary } = useSelector((state) => state.cart);

  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
<<<<<<< HEAD
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isAdmin = location.pathname.startsWith('/admin');

=======
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Khi đã đăng nhập thì load giỏ hàng (để có totalItems trên icon)
>>>>>>> main
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

<<<<<<< HEAD
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

  const handleLogout = async () => {
    await dispatch(logout());
    setIsMenuOpen(false);
    navigate('/login');
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
=======
  // Nhấn giỏ hàng
  const handleOpenCart = () => {
    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirect || '/shop'}`);
      return;
    }
    setIsMiniCartOpen(true);
  };

  // Đăng xuất sau khi confirm
  const handleLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await dispatch(logoutAction());
    setIsUserMenuOpen(false);
    navigate('/shop');
  };

  const cartCount = summary?.totalItems || 0;

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex items-center">
              <Link to="/shop" className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary-600">
                  AquaticPose
>>>>>>> main
                </span>
              </Link>
            </div>

<<<<<<< HEAD
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
                          onClick={handleLogout}
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
=======
            {/* Menu bên phải */}
            <div className="flex items-center gap-4">
              {/* Nút Giỏ hàng (ai cũng thấy, nhưng click thì mới check login) */}
              <button
                type="button"
                onClick={handleOpenCart}
                className="relative p-2 rounded-full hover:bg-gray-100"
              >
                <ShoppingCartIcon className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Nếu chưa đăng nhập → Hiển thị Login / Register */}
              {!user && (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Nếu đã đăng nhập → Hiển thị dropdown Trang cá nhân + Đăng xuất */}
              {user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100"
                  >
                    <UserCircleIcon className="w-7 h-7 text-gray-700" />
                    <span className="text-sm font-medium text-gray-800">
                      {user.username}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-20">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Thông tin cá nhân
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsLogoutConfirmOpen(true)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
>>>>>>> main
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

<<<<<<< HEAD
      {/* Mini Cart Sidebar */}
      <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
=======
      {/* Mini Cart */}
      {user && (
        <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
      )}

      {/* Popup xác nhận đăng xuất */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Xác nhận đăng xuất
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
>>>>>>> main
    </>
  );
};

export default Header;