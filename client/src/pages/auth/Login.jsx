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
    <div className="min-h-screen relative flex overflow-hidden">
      {/* Fullscreen Aquarium Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1524704654690-b56c05c78a00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80" 
          alt="Beautiful Aquarium" 
          className="w-full h-full object-cover"
        />
        {/* Dark Blue/Cyan Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/75 via-cyan-900/65 to-teal-900/70" />
      </div>

      {/* Content Container - Improved Centering */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-16 px-4 sm:px-8 lg:px-20 xl:px-32 py-12">
        
        {/* Hero Text - Left Side (animated fade-in from left) */}
        <div className="w-full lg:w-1/2 lg:flex-shrink-0 animate-fade-in-left">
          <div className="max-w-2xl space-y-6">
            <p className="text-cyan-300 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase">WELCOME TO</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
              EXPLORE<br />HORIZONS
            </h1>
            <p className="text-lg sm:text-xl text-white/95 font-light leading-relaxed">
              Dive into your aquatic dreams<br />and discover endless possibilities.
            </p>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-md">
              Your premium destination for aquatic life, tanks, and accessories. Bringing the ocean to your home.
            </p>
          </div>
        </div>

        {/* Glassmorphism Form Card - Larger & Better Centered (animated slide-in from right) */}
        <div className="w-full lg:w-1/2 flex justify-center animate-slide-in-right">
          <div className="w-full max-w-2xl">
            {/* Extra Large Glassmorphism Card */}
            <div className="backdrop-blur-2xl bg-white/15 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/30 p-8 sm:p-12 lg:p-14">
            <form className="space-y-6" onSubmit={onSubmit}>
            {/* Error Message */}
            {isError && (
              <div className="rounded-xl bg-red-500/90 backdrop-blur-sm p-4 border border-red-400/30">
                <p className="text-sm text-white font-medium">{message}</p>
              </div>
            )}            {/* Email Field */}
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
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={onChange}
                  className="appearance-none block w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                  placeholder="Enter your password"
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

            {/* Forgot Password */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-white/80 hover:text-cyan-300 hover:underline transition-all duration-300">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
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
                    SIGNING IN...
                  </span>
                ) : (
                  'SIGN IN'
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
            <div className="flex justify-center">
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                  width="100%"
                />
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <span className="text-sm text-white/80">Are you new? </span>
              <Link
                to="/register"
                className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 hover:underline transition-all duration-300"
              >
                Create an Account
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

export default Login;
