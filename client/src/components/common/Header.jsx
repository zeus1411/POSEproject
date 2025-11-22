// src/components/common/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ShoppingCartIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { User } from 'lucide-react';

import { fetchCart } from '../../redux/slices/cartSlice';
import { logout as logoutAction } from '../../redux/slices/authSlice';
import MiniCart from './MiniCart';
import NotificationIcon from './NotificationIcon';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const { summary } = useSelector((state) => state.cart);

  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Khi đã đăng nhập thì load giỏ hàng (để có totalItems trên icon)
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

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
    navigate('/');
  };

  const cartCount = summary?.totalItems || 0;
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <header className="bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo / Brand */}
            <div className="flex items-center">
              <Link to={isAdmin ? "/admin/products" : "/"} className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">
                  AquaticPose
                </span>
              </Link>
            </div>

            {/* Navigation Menu - Ẩn với admin */}
            {!isAdmin && (
              <div className="hidden md:flex items-center gap-8">
                <nav className="flex items-center gap-6">
                  <Link 
                    to="/" 
                    className="text-base font-medium text-white hover:text-cyan-100 transition-colors"
                  >
                    Home
                  </Link>
                  <Link 
                    to="/shop" 
                    className="text-base font-medium text-white hover:text-cyan-100 transition-colors"
                  >
                    Shop
                  </Link>
                </nav>
              </div>
            )}

            {/* Menu bên phải */}
            <div className="flex items-center gap-6">
              {/* Mobile shop button - visible on small screens only - Ẩn với admin */}
              {!isAdmin && (
                <div className="md:hidden">
                  <Link
                    to="/shop"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Shop
                  </Link>
                </div>
              )}
              
              {/* Icon thông báo - Ẩn với admin */}
              {!isAdmin && <NotificationIcon />}
              
              {/* Nút Giỏ hàng - Ẩn với admin */}
              {!isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenCart}
                  className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ShoppingCartIcon className="w-8 h-8 text-white" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-teal-600 bg-white rounded-full shadow-md">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Nếu chưa đăng nhập → Hiển thị Login / Register */}
              {!user && (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-base font-medium text-white hover:text-cyan-100 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="text-base font-medium text-teal-600 bg-white hover:bg-cyan-50 px-4 py-2 rounded-lg shadow-md transition-all"
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
                    className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username} 
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'block';
                        }}
                      />
                    ) : (
                      <UserCircleIcon className="w-8 h-8 text-white" />
                    )}
                    <span className="text-base font-medium text-white">
                      {user.username}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20">
                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate('/admin/products');
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-teal-600 hover:bg-teal-50 border-b border-gray-100 rounded-t-xl flex items-center gap-3"
                        >
                          <Cog6ToothIcon className="w-5 h-5" />
                          <span>Quản lý</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3"
                      >
                        <UserCircleIcon className="w-5 h-5" />
                        <span>Thông tin cá nhân</span>
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate('/orders');
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3"
                        >
                          <ShoppingBagIcon className="w-5 h-5" />
                          <span>Đơn hàng của tôi</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsLogoutConfirmOpen(true)}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl flex items-center gap-3"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mini Cart */}
      {user && (
        <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
      )}

      {/* Popup xác nhận đăng xuất */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;