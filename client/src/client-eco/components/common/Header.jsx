// src/components/common/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetChat } from '../../redux/slices/chatSlice'; 
import { 
  ShoppingCartIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { User, AlertCircle } from 'lucide-react';

import { fetchCart } from '../../redux/slices/cartSlice';
import { logout as logoutAction } from '../../redux/slices/authSlice';
import MiniCart from './MiniCart';
import NotificationIcon from './NotificationIcon';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const { summary } = useSelector((state) => state.cart);

  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  const handleOpenCart = () => {
    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirect || '/shop'}`);
      return;
    }
    setIsMiniCartOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await dispatch(logoutAction());
    dispatch(resetChat());
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const cartCount = summary?.totalItems || 0;
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <header className="bg-card/88 backdrop-blur-xl border-b border-water/40 shadow-[0_10px_35px_rgb(var(--deep-ocean)/0.10)] fixed w-full z-50 dark:bg-background/80 dark:border-border/20 dark:shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo / Brand */}
            <div className="flex items-center min-w-[200px]">
              <Link 
                to={isAdmin ? "/admin/products" : "/"} 
                className="flex items-center space-x-3 group"
              >
                {/* Tinh chỉnh 1: Hộp cá và con cá đảo màu cho nhau khi ở theme tối */}
                <div className="w-10 h-10 bg-nature border border-nature rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-ocean group-hover:rotate-12 transition-all duration-300 shadow-[0_12px_24px_rgb(var(--natural-green)/0.22)] dark:bg-white dark:border-white dark:group-hover:bg-white/90 dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <svg className="w-6 h-6 text-white dark:text-[#062323] transition-colors duration-300" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                    <path d="M811.1 354.7L767.5 331c-24.8-13.5-45-35-56.9-60.6l-20.9-45c-11.8-25.5-18.8-52.7-20.7-80.8-1.2-17.1-13.8-31.2-30.6-34.4-19.5-3.6-38.5 8.6-43.3 27.8l-1 3.9c-8.1 32.4-9.8 65.5-5 98.6l11.3 78-272.7 115.8c-81.6 34.7-145.4 99.1-180 178.7-0.9 2.1-1.9 4.3-2.8 6.4-1.2 2.9-2.3 5.9-3.4 8.8-1.2 3.3-2.5 6.6-3.6 9.9-0.9 2.5-1.7 5.1-2.5 7.6-1.3 4-2.5 8.1-3.6 12.2-0.6 2.1-1.2 4.1-1.7 6.2-1.6 6.2-3.1 12.5-4.4 18.9L98.1 821.6c-0.8 4.2 0.4 8.6 3.3 11.7l21 22.4-16.3 15.3c-5 4.7-5.6 12.4-1.4 17.8 12.6 16.4 32.1 24.5 52.3 21.8l162-21.7c9.7-1.3 19.2-3.1 28.6-5.2 2.1-0.5 4.2-0.9 6.3-1.5 9.5-2.3 18.9-4.9 28-7.9 0.2-0.1 0.4-0.2 0.6-0.2 9.7-3.2 19.1-7 28.4-11.1 0.7-0.3 1.4-0.6 2.2-0.9 71.4-31.9 130.7-87.5 166.7-159.3l132.7-264.7 77.2 16.1c32.7 6.8 65.9 7.2 98.7 1.2l4-0.7c7.3-1.3 13.8-4.8 18.8-9.5 8.5-7.9 13.1-19.7 11.6-32-2.1-17-15.4-30.4-32.4-32.7-27.9-3.7-54.6-12.4-79.3-25.8z" fill="currentColor" />
                    <path d="M218.6 729.1m-25.5 0a25.5 25.5 0 1 0 51 0 25.5 25.5 0 1 0-51 0Z" fill="currentColor" />
                    <path d="M814.2 358l-43.6-23.7c-24.8-13.5-45-35-56.9-60.6l-20.9-45C681 203.2 674 176 672.1 147.9c-1.2-17.1-13.8-31.2-30.6-34.4-19.5-3.6-38.5 8.6-43.3 27.8l-1 3.9c-8.1 32.4-9.8 65.5-5 98.6l11.3 78-272.7 115.9c-81.6 34.7-145.4 99.1-180.1 178.7-0.9 2.1-1.9 4.3-2.8 6.4-1.2 2.9-2.3 5.9-3.4 8.8-1.2 3.3-2.5 6.6-3.6 9.9-0.9 2.5-1.7 5.1-2.5 7.6-1.3 4-2.5 8.1-3.6 12.2-0.6 2.1-1.2 4.1-1.7 6.2-1.6 6.2-3.1 12.5-4.4 18.9L101.2 825c-0.8 4.2 0.4 8.6 3.3 11.7l21 22.4-16.4 15.4c-5 4.7-5.6 12.4-1.4 17.8 12.6 16.4 32.1 24.5 52.3 21.8l162-21.7c9.7-1.3 19.2-3.1 28.6-5.2 2.1-0.5 4.2-0.9 6.3-1.5 9.5-2.3 18.9-4.9 28-7.9 0.2-0.1 0.4-0.2 0.6-0.2 9.7-3.2 19.1-7 28.4-11.1 0.7-0.3 1.4-0.6 2.2-0.9 71.4-31.9 130.7-87.5 166.7-159.3l132.7-264.7 77.2 16.1c32.7 6.8 65.9 7.2 98.7 1.2l4-0.7c7.3-1.3 13.8-4.8 18.8-9.5 8.5-7.9 13.1-19.7 11.6-32-2.1-17-15.4-30.4-32.4-32.7-27.8-3.9-54.5-12.6-79.2-26zM156.5 887.6c-6.6 0.9-13.1-0.5-18.7-3.7l15.6-14.6c5.3-5 5.6-13.4 0.6-18.8l-25.4-27.1 26.2-131.9c1.7-8.6 3.9-17.1 6.3-25.5 0.5-1.9 1.1-3.8 1.7-5.7 5.4-17.5 12.2-34.5 20.6-50.9 0.2-0.4 0.4-0.7 0.6-1.1 4.4-8.5 9.2-16.9 14.4-25.1 27.6 4.9 54.3 14.3 79.1 27.4 3.4 1.8 6.7 3.8 10 5.7 3.3 1.9 6.7 3.9 9.9 5.9 3.1 2 6.2 4.2 9.2 6.4 3.2 2.2 6.4 4.4 9.5 6.8 3.3 2.6 6.5 5.3 9.8 8 2.6 2.2 5.3 4.3 7.8 6.5 5.7 5.1 11.2 10.5 16.5 16.1 4.4 4.7 8.5 9.6 12.6 14.6 2 2.5 4 5 5.9 7.5 1.2 1.6 2.4 3.3 3.6 5 5.3 7.4 10.5 15.1 15.2 23.2 0 0.1 0.2 0.1 0.2 0.2 20.7 35.4 33.4 74.7 36.5 115.2-8 4.2-16.1 8-24.3 11.6-0.6 0.2-1.1 0.5-1.7 0.7-8.2 3.4-16.6 6.6-25 9.3-0.6 0.2-1.2 0.4-1.9 0.5-7.3 2.3-14.7 4.3-22.1 6-2.1 0.5-4.1 1-6.2 1.4-8.1 1.8-16.3 3.3-24.6 4.4l-161.9 22zM298.9 592l37-59.8c4.7-7.5 14.3-10.5 22.4-6.8 44.9 20.4 80.1 56.7 99.3 102.2l13.6 32.2c2.1 4.9 1.8 10.4-0.6 15.1-2.4 4.7-6.8 8-12 9.1l-52.9 11c-5.3-8.5-11-16.7-17.1-24.7l30.8-19.1c0.8-0.5 1.5-1 2.1-1.6 4.5-4.2 5.6-11.2 2.2-16.7-3.9-6.2-12-8.1-18.3-4.3l-34.1 21.2c-0.6-0.6-1-1.3-1.6-1.9-5.6-6-11.5-11.7-17.5-17.2-1.6-1.4-3.2-2.7-4.8-4.1-1.2-1.1-2.5-2.1-3.7-3.2l24.6-34.5c4.2-6 2.8-14.3-3.1-18.5-6-4.3-14.3-2.8-18.5 3.1l-23.9 33.6c-3.1-2.2-6.1-4.2-9.3-6.3-2.2-1.4-4.4-2.8-6.6-4.1-2.8-1.5-5.3-3.2-8-4.7z m600.6-172.4c0.7 5.8-3.2 11.1-8.9 12.2l-4 0.7c-29.4 5.4-59.2 5.1-88.4-1L711 413.3c-4.3-0.9-8.7 0.4-11.8 3.3-1.1 1-2.1 2.3-2.8 3.7L559.2 694.2c-25.5 50.8-63.7 92.8-109.8 123-4.1-34.1-14.3-67.1-29.9-97.9l44.6-9.5c8-1.7 15.3-5.5 21.1-11 3.6-3.4 6.6-7.3 8.9-11.8 6.1-11.7 6.7-25.5 1.5-37.7L482 617.2c-21.8-51.6-61.8-92.8-112.8-116-20.2-9.2-44.3-1.9-56 17L275.1 580c-19.3-8.9-39.4-15.9-60.1-20.4 32.6-42.1 75.7-76 126.3-97.5l281.9-119.8c5.5-2.3 8.8-8.1 7.9-14.1L618.4 240c-4.3-29.6-2.7-59.3 4.5-88.3l1-3.9c1.4-5.6 7-9.2 12.7-8.2 4.9 0.9 8.6 5.1 9 10.1 2.1 31.3 9.9 61.6 23.1 90.1l20.9 45c14.3 30.8 38.5 56.6 68.4 72.8l43.6 23.7c27.6 15 57.4 24.7 88.5 28.8 4.9 0.6 8.8 4.6 9.4 9.5z" fill="currentColor" />
                    <path d="M641.2 435.9m-15.3 0a15.3 15.3 0 1 0 30.6 0 15.3 15.3 0 1 0-30.6 0Z" fill="currentColor" />
                    <path d="M606.5 510.6m-15.3 0a15.3 15.3 0 1 0 30.6 0 15.3 15.3 0 1 0-30.6 0Z" fill="currentColor" />
                    <path d="M575 579.1m-15.3 0a15.3 15.3 0 1 0 30.6 0 15.3 15.3 0 1 0-30.6 0Z" fill="currentColor" />
                    <path d="M298.9 592l37-59.8c4.7-7.5 14.3-10.5 22.4-6.8 44.9 20.4 80.1 56.7 99.3 102.2l13.6 32.2c2.1 4.9 1.8 10.4-0.6 15.1-2.4 4.7-6.8 8-12 9.1l-52.9 11c-5.3-8.5-11-16.7-17.1-24.7l30.8-19.1c0.8-0.5 1.5-1 2.1-1.6 4.5-4.2 5.6-11.2 2.2-16.7-3.9-6.2-12-8.1-18.3-4.3l-34.1 21.2c-0.6-0.6-1-1.3-1.6-1.9-5.6-6-11.5-11.7-17.5-17.2-1.6-1.4-3.2-2.7-4.8-4.1-1.2-1.1-2.5-2.1-3.7-3.2l24.6-34.5c4.2-6 2.8-14.3-3.1-18.5-6-4.3-14.3-2.8-18.5 3.1l-23.9 33.6c-3.1-2.2-6.1-4.2-9.3-6.3-2.2-1.4-4.4-2.8-6.6-4.1-2.8-1.5-5.3-3.2-8-4.7z" fill="currentColor" />
                    <path d="M668.1 313.7c-3.6 3.4-8.9 4.4-13.7 2.3-6.4-2.8-9.3-10.3-6.4-16.6l22.6-51.2c2.8-6.3 10.2-9.3 16.6-6.5 6.4 2.8 9.3 10.3 6.4 16.6L671 309.6c-0.7 1.5-1.7 2.9-2.9 4.1z" fill="currentColor" />
                    <path d="M811.3 378.3c-0.4 0.3-0.8 0.7-1.2 1l-26.2 19.2c-5.6 4.1-13.5 2.9-17.6-2.7-4.1-5.6-2.9-13.5 2.7-17.6l26.2-19.2c5.6-4.1 13.5-2.9 17.6 2.7 3.9 5.2 3.1 12.3-1.5 16.6z" fill="currentColor" />
                    <path d="M761.5 350.9c-0.2 0.2-0.5 0.4-0.7 0.6l-44.2 35.8c-5.4 4.4-13.3 3.5-17.7-1.9-4.4-5.4-3.7-13.3 1.9-17.7l44.2-35.8c5.4-4.4 13.3-3.5 17.7 1.9 4.1 5.2 3.5 12.6-1.2 17.1z" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-headline font-bold text-foreground tracking-tight">
                    Aquatic<span className="text-[#91c8e4]">Caps</span>
                  </span>
                  <span className="text-xs font-medium text-nature dark:text-primary/80">Cửa Hàng Thủy Sinh Cao Cấp</span>
                </div>
              </Link>
            </div>

            {/* Navigation Menu - Ẩn với admin */}
            {!isAdmin && (
              <div className="hidden md:flex items-center justify-center flex-1">
                <nav className="flex items-center space-x-2">
                  <Link 
                    to="/" 
                    className={`relative px-6 py-2 text-sm font-body font-semibold rounded-lg transition-all duration-200 ${
                      location.pathname === '/' 
                        ? 'text-ocean bg-aqua/35 border border-water/40 dark:text-primary dark:bg-primary/10 dark:border-primary/20' 
                        : 'text-foreground/80 hover:text-ocean hover:bg-aqua/20 dark:text-muted-foreground dark:hover:text-primary dark:hover:bg-muted/60'
                    }`}
                  >
                    Trang chủ
                    {location.pathname === '/' && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-nature rounded-full dark:bg-primary dark:shadow-glow-cyan"></span>
                    )}
                  </Link>
                  <Link 
                    to="/shop" 
                    className={`relative px-6 py-2 text-sm font-body font-semibold rounded-lg transition-all duration-200 ${
                      location.pathname.startsWith('/shop')
                        ? 'text-ocean bg-aqua/35 border border-water/40 dark:text-primary dark:bg-primary/10 dark:border-primary/20' 
                        : 'text-foreground/80 hover:text-ocean hover:bg-aqua/20 dark:text-muted-foreground dark:hover:text-primary dark:hover:bg-muted/60'
                    }`}
                  >
                    Cửa hàng
                    {location.pathname.startsWith('/shop') && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-nature rounded-full dark:bg-primary dark:shadow-glow-cyan"></span>
                    )}
                  </Link>
                  <Link 
                    to="/blogs" 
                    className={`relative px-6 py-2 text-sm font-body font-semibold rounded-lg transition-all duration-200 ${
                      location.pathname.startsWith('/blogs')
                        ? 'text-ocean bg-aqua/35 border border-water/40 dark:text-primary dark:bg-primary/10 dark:border-primary/20' 
                        : 'text-foreground/80 hover:text-ocean hover:bg-aqua/20 dark:text-muted-foreground dark:hover:text-primary dark:hover:bg-muted/60'
                    }`}
                  >
                    Blog
                    {location.pathname.startsWith('/blogs') && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-nature rounded-full dark:bg-primary dark:shadow-glow-cyan"></span>
                    )}
                  </Link>
                </nav>
              </div>
            )}

            {/* Menu bên phải - Hệ thống nút bấm đồng bộ 100% Size & Border */}
            <div className="flex items-center gap-3.5 min-w-[200px] justify-end">
              {!isAdmin && (
                <div className="md:hidden flex items-center gap-2">
                  <Link
                    to="/shop"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-primary-foreground bg-ocean rounded-lg hover:bg-primary-hover transition-colors dark:bg-primary/90 dark:hover:bg-primary"
                  >
                    Shop
                  </Link>
                </div>
              )}
              
              {/* 1. NÚT NOTIFICATION (Đồng bộ Khung viền & Kích thước) */}
              {user && (
                <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-water/30 dark:border-border/50 bg-muted/10 hover:bg-muted/30 dark:hover:bg-muted/20 transition-all duration-200 shrink-0">
                  <NotificationIcon />
                </div>
              )}

              {/* 2. NÚT THEME TOGGLE (Đồng bộ Khung viền & Kích thước) */}
              <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-water/30 dark:border-border/50 bg-muted/10 hover:bg-muted/30 dark:hover:bg-muted/20 transition-all duration-200 shrink-0">
                <ThemeToggle />
              </div>
              
              {/* 3. NÚT GIỎ HÀNG (Đồng bộ Khung viền & Kích thước) */}
              {!isAdmin && (
                <button
                  type="button"
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={handleOpenCart}
                  className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-water/30 dark:border-border/50 bg-muted/10 hover:bg-muted/30 dark:hover:bg-muted/20 transition-all duration-200 shrink-0 text-foreground"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-black leading-none text-destructive-foreground bg-destructive rounded-full shadow-md ring-2 ring-card">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {!user && (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-5 py-2 text-sm font-body font-semibold text-foreground/80 hover:text-ocean hover:bg-aqua/20 rounded-lg transition-all duration-200 dark:text-muted-foreground dark:hover:text-primary dark:hover:bg-muted/60"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 text-sm font-body font-semibold text-primary-foreground bg-ocean hover:bg-primary-hover rounded-lg shadow-[0_12px_24px_rgb(var(--deep-ocean)/0.18)] hover:shadow-lg transition-all duration-200 dark:bg-primary dark:hover:bg-primary/90 dark:shadow-glow-cyan"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* 4. CỤM ACCOUNT BUTTON (Tỉ lệ chuẩn theo dàn nút bên cạnh) */}
              {user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2.5 h-10 pl-2 pr-4 rounded-xl bg-muted/10 border border-water/30 dark:border-border/50 hover:bg-muted/30 dark:hover:bg-muted/20 transition-all duration-200"
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username} 
                        className="w-6 h-6 rounded-lg object-cover border border-water/10 dark:border-white/5 shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'block';
                        }}
                      />
                    ) : (
                      <UserCircleIcon className="w-6 h-6 text-foreground" />
                    )}
                    <span className="text-sm font-bold text-foreground tracking-tight max-w-[100px] truncate">
                      {user.username}
                    </span>
                  </button>

                  {/* DROPDOWN USER MENU (Giữ nguyên phần CSS Grid hoàn hảo đã tinh chỉnh ở bước trước) */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border/30 rounded-xl shadow-xl z-20 overflow-hidden backdrop-blur-xl bg-card/95 p-1.5 space-y-1">
                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate('/admin/products');
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg border border-transparent hover:border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center gap-3 transition-all group"
                        >
                          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-md shrink-0 border border-emerald-200/50 dark:border-emerald-500/30">
                            <Cog6ToothIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate">Hệ thống Quản lý</span>
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg border border-transparent hover:border-sky-500/20 hover:bg-sky-500/5 dark:hover:bg-sky-500/10 flex items-center gap-3 transition-all group"
                      >
                        <div className="p-1.5 bg-sky-100 dark:bg-sky-500/10 rounded-md shrink-0 border border-sky-200/50 dark:border-sky-500/20">
                          <UserCircleIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-gray-200 truncate">Thông tin cá nhân</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/my-blogs');
                        }}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg border border-transparent hover:border-teal-500/20 hover:bg-teal-500/5 dark:hover:bg-teal-500/10 flex items-center gap-3 transition-all group"
                      >
                        <div className="p-1.5 bg-teal-100 dark:bg-teal-500/10 rounded-md shrink-0 border border-teal-200/50 dark:border-teal-500/20">
                          <DocumentTextIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-gray-200 truncate">Bài viết của tôi</span>
                      </button>

                      {user.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate('/orders');
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg border border-transparent hover:border-indigo-500/20 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 flex items-center gap-3 transition-all group"
                        >
                          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/10 rounded-md shrink-0 border border-indigo-200/50 dark:border-indigo-500/20">
                            <ShoppingBagIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="font-medium text-slate-700 dark:text-gray-200 truncate">Đơn hàng của tôi</span>
                        </button>
                      )}

                      <div className="my-1 border-t border-border/20"></div>

                      <button
                        type="button"
                        onClick={() => setIsLogoutConfirmOpen(true)}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg border border-transparent hover:border-rose-500/30 hover:bg-rose-500/10 flex items-center gap-3 transition-all group"
                      >
                        <div className="p-1.5 bg-rose-100 dark:bg-rose-500/20 rounded-md shrink-0 border border-rose-200/50 dark:border-rose-500/30">
                          <ArrowRightOnRectangleIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        <span className="font-bold text-rose-600 dark:text-rose-400 truncate">Đăng xuất tài khoản</span>
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

      {/* POPUP XÁC NHẬN ĐĂNG XUẤT */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="bg-card text-card-foreground border border-border/30 rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-2">
              Xác nhận đăng xuất
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-card-foreground bg-muted rounded-lg hover:bg-muted/80"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90"
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
