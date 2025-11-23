import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, googleLogin, reset } from '../../redux/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess && user) {
      // Redirect dựa theo role
      if (user.role === 'admin') {
        navigate('/admin/products');
      } else {
        navigate('/');
      }
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

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      
      {/* Left Side - Login Form (1/3 width) */}
      <div className="w-full lg:w-1/3 flex items-center justify-center px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-md relative z-10 shadow-2xl">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Đăng nhập
            </h2>
            <p className="text-sm text-gray-600">
              Đăng nhập để khám phá thế giới dưới nước
            </p>
          </div>

          {/* Form */}
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {/* Error Message */}
            {isError && (
              <div className="rounded-xl bg-red-50 p-3 border border-red-200 shadow-sm animate-shake">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-cyan-500 group-focus-within:text-cyan-600 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={onChange}
                  className="appearance-none block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-cyan-500 group-focus-within:text-cyan-600 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={onChange}
                  className="appearance-none block w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center group"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-cyan-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-cyan-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded cursor-pointer transition-all"
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-semibold text-cyan-600 hover:text-teal-600 transition duration-200">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 hover:from-cyan-600 hover:via-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng nhập...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Đăng nhập
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Hoặc</span>
                </div>
              </div>
            </div>

            {/* Google Login Button */}
            <div className="mt-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
                width="100%"
              />
            </div>

            {/* Register Link */}
            <div className="mt-6">
              <div className="text-center">
                <span className="text-sm text-gray-600">Chưa có tài khoản? </span>
                <Link
                  to="/register"
                  className="text-sm font-bold text-cyan-600 hover:text-teal-600 transition-colors duration-200"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-500">
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <Link to="/terms" className="font-medium text-cyan-600 hover:text-teal-600 transition">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link to="/privacy" className="font-medium text-cyan-600 hover:text-teal-600 transition">
              Chính sách bảo mật
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Background Image (2/3 width) */}
      <div className="hidden lg:block lg:w-2/3 relative overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-teal-500/20 to-blue-500/30 z-10" />
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white/80 to-transparent z-10" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-32 right-32 w-40 h-40 bg-cyan-300/20 rounded-full blur-3xl animate-float-delayed" />
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Aquatic Background" 
            className="w-full h-full object-cover scale-105 animate-zoom"
          />
        </div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center px-12 max-w-2xl">
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl animate-fade-in">
              Khám phá thế giới dưới nước
            </h1>
            <p className="text-xl text-white/90 drop-shadow-lg animate-fade-in-delayed">
              Cùng Aquatic Store mang đại dương về nhà bạn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
