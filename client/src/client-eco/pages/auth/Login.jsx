import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, googleLogin } from '../../redux/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, message, isSuccess } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess && user) {
      user.role === 'admin' ? navigate('/admin/products') : navigate('/');
    }
  }, [isSuccess, user, navigate]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-end lg:pr-32 overflow-x-hidden font-['Space_Grotesk'] antialiased">
      
      {/* Background Layer - Dùng absolute để zoom đồng bộ với content */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/BackgroundImage.png" 
          alt="Aquatic Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Hiệu ứng đặc biệt: Floating Bubbles (Bọt khí) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bubble absolute bg-white/20 rounded-full backdrop-blur-[1px] border border-white/30"
            style={{
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
              left: `${Math.random() * 100}%`,
              bottom: '-50px',
              animation: `float ${Math.random() * 5 + 5}s infinite ease-in`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Main Container - Kích thước max-w-lg (bản cũ bạn thích) */}
      <main className="relative z-20 w-full max-w-lg px-6 py-12">
        
        {/* Glassmorphism Card */}
        <div className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl p-10 md:p-14 transition-all duration-300">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-['Fraunces'] text-4xl md:text-5xl text-[#f3e8d2] font-semibold tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-white/60 text-sm">Vui lòng nhập thông tin để tiếp tục</p>
          </div>

          {isError && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-white text-xs text-center">
              {message}
            </div>
          )}

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/90 ml-1">Email</label>
              <input
                className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                name="email"
                type="email"
                placeholder="Email của bạn"
                required
                value={email}
                onChange={onChange}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/90 ml-1">Mật khẩu</label>
              <div className="relative">
                <input
                  className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu"
                  required
                  value={password}
                  onChange={onChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-white/50 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              className="w-full mt-4 bg-[#1d6ce5] hover:bg-[#1a5fca] text-white font-bold py-4 rounded-full shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-sm"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
            </button>
          </form>

          <div className="mt-5">
            <button 
              type="button"
              onClick={() => document.querySelector('[role="button"]')?.click()}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white hover:bg-gray-100 text-gray-800 font-bold rounded-full transition-all active:scale-[0.98] shadow-md text-xs tracking-wider"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              </svg>
              ĐĂNG NHẬP VỚI GOOGLE
            </button>
            <div className="hidden">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => {}} useOneTap={false} />
            </div>
          </div>

          <div className="mt-10 text-center text-white/70 text-sm">
            <span>Bạn mới? </span>
            <Link to="/register" className="font-bold text-white hover:underline transition-all underline-offset-4">
              Tạo tài khoản
            </Link>
          </div>
        </div>
      </main>

      {/* CSS cho hiệu ứng Bubbles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
        }
        .bubble {
          will-change: transform;
        }
      `}} />
    </div>
  );
};

export default Login;