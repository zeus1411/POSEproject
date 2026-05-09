import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, googleLogin } from '../../redux/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, message, isSuccess } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess && user) {
      if (user.role === 'admin') {
        navigate('/admin/products');
      } else {
        navigate('/');
      }
    }
  }, [isSuccess, user, navigate]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-['Space_Grotesk'] text-[#1a1c1c] antialiased bg-[#f9f9f8]">
      
      {/* Background Layer - Đúng chất Aquatic Luxury của Mockup */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear scale-105"
          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDu65e0WwHz9hWbV3WRJdVfxIh9HDolvaDj2b3KjTlkNUwxnk2GwBOuR7Ev1yH4Fy_WD1c-RRucEv9LUeAPmFisf-jD2kiFtWiTVQoMOzkMw3Z2y2T3j9tUzwiTtRAOj5sF2zib7WxVOqf5fJ1fOzb4vyzG2lklD-4ON38wUkUifxSKby-RicvOydzU45B92s0ugR624wCVaH2Lk8kmwNRNZ5SImMlWxorY8zbpOhELj5jdZi0Kt8AU-NY_9FkCvIyxS0qIVznENvrW')` }}
        />
        {/* Lớp phủ Gradient đa tầng tạo hiệu ứng ánh sáng dưới nước */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f9f9f8]/60 via-[#0b3a3a]/40 to-[#002323]/80 backdrop-blur-[2px]" />
      </div>

      {/* Main Container - max-w-xl (576px) là tỷ lệ vàng cho Login Box */}
      <main className="relative z-10 w-full max-w-xl px-4 py-8 flex items-center justify-center min-h-screen">
        
        {/* Glassmorphism Card - Padding được cân đối lại để không bị dài quá mức */}
        <div className="w-full bg-[#ffffff]/70 backdrop-blur-2xl border border-[#3c6565]/20 rounded-xl shadow-[0_30px_60px_rgba(0,35,35,0.15)] p-8 md:p-14 relative overflow-hidden transition-all">
          
          {/* Subtle Glows - Hiệu ứng ánh sáng sinh học */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#b3efde]/30 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#a3cfce]/20 rounded-full blur-[80px] pointer-events-none" />

          {/* Header - Kiểu chữ Fraunces chuyên nghiệp */}
          <div className="text-center mb-10 relative z-10">
            <h1 className="font-['Fraunces'] text-[36px] md:text-[42px] leading-tight text-[#002323] font-bold tracking-tight mb-2">
              AquaticPose
            </h1>
            <p className="font-['Space_Grotesk'] text-sm md:text-base text-[#404848]">
              Đăng nhập vào tác phẩm nghệ thuật sống của bạn.
            </p>
          </div>

          {/* Error Alert */}
          {isError && (
            <div className="mb-6 p-3 bg-[#ffdad6]/80 backdrop-blur-sm border border-[#ba1a1a]/20 rounded-lg text-[#93000a] text-xs font-medium text-center">
              {message}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6 relative z-10" onSubmit={onSubmit}>
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#1a1c1c]" htmlFor="email">
                Địa chỉ Email
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#717978]">
                  <EnvelopeIcon className="h-5 w-5" />
                </span>
                <input
                  className="block w-full pl-12 pr-4 py-3 bg-[#f9f9f8]/50 border border-[#c0c8c7]/60 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#002323]/40 focus:border-[#002323] transition-all"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="expert@aquascape.com"
                  required
                  value={email}
                  onChange={onChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-[#1a1c1c]" htmlFor="password">
                  Mật khẩu
                </label>
                <Link to="/forgot-password" size="sm" className="text-xs font-medium text-[#2e685b] hover:text-[#002323] transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#717978]">
                  <LockClosedIcon className="h-5 w-5" />
                </span>
                <input
                  className="block w-full pl-12 pr-12 py-3 bg-[#f9f9f8]/50 border border-[#c0c8c7]/60 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#002323]/40 focus:border-[#002323] transition-all"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={onChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#717978] hover:text-[#002323]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              className="w-full mt-4 bg-[#002323] text-[#ffffff] font-['Space_Grotesk'] text-[12px] font-bold tracking-[0.1em] uppercase py-4 px-6 rounded-full flex items-center justify-center gap-3 hover:-translate-y-1 shadow-[0_8px_16px_rgba(0,35,35,0.15)] hover:shadow-[0_12px_24px_rgba(0,35,35,0.25)] hover:bg-[#234d4d] transition-all group disabled:opacity-70"
              type="submit"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}</span>
              {!isLoading && <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6 relative flex items-center">
            <div className="flex-grow border-t border-[#c0c8c7]/40"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] font-bold tracking-[0.1em] text-[#717978] uppercase">Hoặc tiếp tục với</span>
            <div className="flex-grow border-t border-[#c0c8c7]/40"></div>
          </div>

          {/* Social Logins - Grid 2 cột chuẩn Mockup */}
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <button 
              type="button"
              onClick={() => document.querySelector('[role="button"]')?.click()}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#ffffff]/40 border border-[#c0c8c7]/50 rounded-full text-sm font-medium text-[#1a1c1c] hover:bg-[#f3f4f3] transition-colors backdrop-blur-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            
            <button 
              type="button"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#ffffff]/40 border border-[#c0c8c7]/50 rounded-full text-sm font-medium text-[#1a1c1c] hover:bg-[#f3f4f3] transition-colors backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.05 2.78.72 3.4 1.8-3.05 1.65-2.52 5.58.4 6.69-.8 2.03-1.8 4-2.45 4.52zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"></path>
              </svg>
              Apple
            </button>

            <div className="hidden">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => {}} useOneTap={false} />
            </div>
          </div>

          {/* Footer - Cân đối khoảng cách */}
          <div className="mt-10 text-center relative z-10 border-t border-[#c0c8c7]/10 pt-6">
            <p className="text-sm text-[#404848]">
              Bạn chưa có tài khoản? 
              <Link to="/register" className="text-[#002323] font-bold hover:text-[#2e685b] transition-all ml-1">
                Tạo tài khoản
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;