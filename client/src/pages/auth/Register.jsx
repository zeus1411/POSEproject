import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, googleLogin, reset, setError } from '../../redux/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { username, email, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess && user) {
      // ✅ FIX: Navigate to /shop instead of /
      navigate('/shop');
    }
    // Remove dispatch(reset()) to prevent premature state reset
  }, [isSuccess, user, navigate]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      // Set error through Redux instead of alert
      dispatch(setError('Mật khẩu không khớp'));
      return;
    }

    const userData = {
      username,
      email,
      password,
    };

    dispatch(register(userData));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
  };

  return (
    <div className="min-h-screen relative flex overflow-hidden">
      {/* Fullscreen Aquarium Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1535591273668-578e31182c4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80" 
          alt="Tropical Fish Aquarium" 
          className="w-full h-full object-cover"
        />
        {/* Dark Blue/Cyan Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/75 via-cyan-900/65 to-blue-900/70" />
      </div>

      {/* Content Container - Improved Centering */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-16 px-4 sm:px-8 lg:px-20 xl:px-32 py-12">
        
        {/* Hero Text - Left Side (animated fade-in from left) */}
        <div className="w-full lg:w-1/2 lg:flex-shrink-0 animate-fade-in-left">
          <div className="max-w-2xl space-y-6">
            <p className="text-teal-300 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase">THAM GIA VỚI CHÚNG TÔI</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-script text-white leading-tight drop-shadow-lg tracking-wide">
              BƯỚC VÀO<br />HÀNH TRÌNH
            </h1>
            <p className="text-lg sm:text-xl text-white/95 font-light leading-relaxed">
              Tham gia cộng đồng thủy sinh<br />với hàng nghìn sản phẩm chất lượng.
            </p>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-md">
              Khám phá thế giới dưới làn sóng và mang đại dương về nhà. Bắt đầu hành trình của bạn ngay hôm nay.
            </p>
          </div>
        </div>

        {/* Glassmorphism Form Card - Larger & Better Centered (animated slide-in from right) */}
        <div className="w-full lg:w-1/2 flex justify-center animate-slide-in-right">
          <div className="w-full max-w-2xl">
            {/* Extra Large Glassmorphism Card */}
            <div className="backdrop-blur-2xl bg-white/15 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/30 p-8 sm:p-12 lg:p-14">
            <form className="space-y-5" onSubmit={onSubmit}>
            {/* Error Message */}
            {isError && (
              <div className="rounded-xl bg-red-500/90 backdrop-blur-sm p-4 border border-red-400/30">
                <p className="text-sm text-white font-medium">{message}</p>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                Tên người dùng
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={onChange}
                className="appearance-none block w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                placeholder="Nhập tên người dùng"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={onChange}
                className="appearance-none block w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                placeholder="Nhập email của bạn"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={onChange}
                  className="appearance-none block w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                  placeholder="Tạo mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={onChange}
                  className="appearance-none block w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                  placeholder="Xác nhận mật khẩu của bạn"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-6 border border-transparent text-sm font-bold tracking-wider rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ĐANG TẠO TÀI KHOẢN...
                  </span>
                ) : (
                  'TẠO TÀI KHOẢN'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 backdrop-blur-xl bg-white/10 text-white/90 font-medium">or</span>
              </div>
            </div>

            {/* Google Login Button */}
            <div className="flex justify-center relative z-50">
              <button
                type="button"
                onClick={() => {
                  // Trigger Google Login programmatically
                  document.querySelector('[role="button"]')?.click();
                }}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white hover:bg-gray-50 text-gray-700 font-bold tracking-wider rounded-xl border border-gray-300 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>ĐĂNG KÝ VỚI GOOGLE</span>
              </button>
              <div className="hidden">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                />
              </div>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <span className="text-sm text-white/80">Đã có tài khoản? </span>
              <Link
                to="/login"
                className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 hover:underline transition-all duration-300"
              >
                Đăng nhập
              </Link>
            </div>
          </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
