import React, { useState, useEffect, useMemo } from 'react';
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

// --- Reuse Bubbles Component from Register ---
const Bubbles = () => {
  const bubbleCount = 15; 
  const bubbles = useMemo(() => {
    return Array.from({ length: bubbleCount }).map((_, i) => ({
      id: i,
      size: Math.random() * 30 + 15, // Kích thước to y chang Register
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: Math.random() * 8 + 7,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute bottom-[-50px] rounded-full border border-white/20 bg-white/10 animate-rise"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
            '--bubble-opacity': bubble.opacity,
            boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.2)',
          }}
        />
      ))}
    </div>
  );
};

// --- Custom CSS for Aquatic Effects ---
const aquaticStyles = `
  @keyframes rise {
    0% { transform: translateY(0) scale(0.5); opacity: 0; }
    15% { opacity: var(--bubble-opacity, 0.4); }
    100% { transform: translateY(-110vh) scale(1.2); opacity: 0; }
  }

  @keyframes floating {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }

  .animate-rise {
    animation-name: rise;
    animation-timing-function: ease-in;
    animation-iteration-count: infinite;
  }

  .animate-float {
    animation: floating 6s ease-in-out infinite;
  }

  .btn-aquatic {
    position: relative;
    overflow: hidden;
    z-index: 1;
  }

  .btn-aquatic::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.6s ease-out, opacity 0.6s ease-out;
    pointer-events: none;
    z-index: -1;
  }

  .btn-aquatic:hover::after {
    transform: translate(-50%, -50%) scale(20);
    opacity: 0;
  }
`;

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
    <>
      <style>{aquaticStyles}</style>

      <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-end lg:pr-32 overflow-hidden font-['Space_Grotesk'] antialiased">
        
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/BackgroundImage.png" 
            alt="Aquatic Background"
            className="w-full h-full object-cover scale-105" // Scale nhẹ để tránh lề trắng
          />
          {/* Overlay đậm hơn một chút để nổi bật Form */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950/40 via-black/30 to-blue-900/40" />
          
          {/* New Improved Bubbles */}
          <Bubbles />
        </div>

        {/* Main Container với hiệu ứng Float */}
        <main className="relative z-20 w-full max-w-2xl px-6 py-12 animate-float">
          
          {/* Glassmorphism Card */}
          <div className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-12 md:p-16 transition-all duration-300">
            
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="font-['Fraunces'] text-5xl md:text-6xl text-[#f3e8d2] font-semibold tracking-tight mb-4 drop-shadow-md">
                Welcome back
              </h1>
              <p className="text-white/70 text-base">Vui lòng nhập thông tin để tiếp tục</p>
            </div>

            {/* Form */}
            <form className="space-y-7" onSubmit={onSubmit}>
              <div className="space-y-3">
                <label className="block text-base font-medium text-white/90 ml-2">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-white/40" />
                  <input
                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/20 rounded-2xl text-white text-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                    name="email"
                    type="email"
                    placeholder="Email của bạn"
                    required
                    value={email}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90 ml-1">Mật khẩu</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
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
                className="btn-aquatic w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-5 rounded-full shadow-lg text-base uppercase tracking-[0.2em]"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    ĐANG ĐĂNG NHẬP...
                  </span>
                ) : 'ĐĂNG NHẬP'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-transparent text-white/40 uppercase tracking-widest">hoặc</span>
              </div>
            </div>

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

            <div className="mt-10 text-center text-white/60 text-sm">
              <span>Bạn mới? </span>
              <Link to="/register" className="font-bold text-cyan-300 hover:text-cyan-200 hover:underline transition-all underline-offset-4">
                Tạo tài khoản
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Login;