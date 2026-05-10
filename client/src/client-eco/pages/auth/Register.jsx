import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  sendRegistrationOTP, 
  resendRegistrationOTP, 
  verifyRegistrationOTP, 
  googleLogin, 
  reset, 
  resetOTP,
  setError 
} from '../../redux/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// --- Bubbles Effect Component ---
const Bubbles = () => {
  const bubbleCount = 20; // Số lượng bong bóng

  const bubbles = useMemo(() => {
    return Array.from({ length: bubbleCount }).map((_, i) => ({
      id: i,
      size: Math.random() * 15 + 5, // Kích thước từ 5px đến 20px
      left: Math.random() * 100,    // Vị trí ngang ngẫu nhiên (0% - 100%)
      delay: Math.random() * 5,     // Độ trễ bắt đầu ngẫu nhiên (0s - 5s)
      duration: Math.random() * 10 + 10, // Thời gian bay ngẫu nhiên (10s - 20s)
      opacity: Math.random() * 0.5 + 0.2, // Độ mờ ngẫu nhiên (0.2 - 0.7)
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-1">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute bottom-0 rounded-full bg-white/60 animate-rise"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
            opacity: bubble.opacity,
          }}
        />
      ))}
    </div>
  );
};

// --- Custom CSS for Animations ---
const aquaticStyles = `
  @keyframes rise {
    0% {
      transform: translateY(0) scale(0.5);
      opacity: 0;
    }
    15% {
      opacity: var(--bubble-opacity, 0.4);
    }
    /* Bong bóng bay lên đến đỉnh màn hình (-110vh) */
    100% {
      transform: translateY(-110vh) scale(1.2);
      opacity: 0;
    }
  }

  @keyframes floating {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }

  .animate-float {
    animation: floating 6s ease-in-out infinite;
  }

  .animate-rise {
    animation-name: rise;
    animation-timing-function: ease-in;
    animation-iteration-count: infinite;
  }

  /* Sửa hiệu ứng sóng cho nút bấm - Phủ toàn bộ */
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
    /* Sử dụng đơn vị em để tỉ lệ với nút */
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
    /* Scale lớn hẳn để bao phủ toàn bộ diện tích nút */
    transform: translate(-50%, -50%) scale(15);
    opacity: 0;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
`;

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { username, email, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { 
    user, 
    isLoading, 
    isError, 
    isSuccess, 
    message,
    otpSent,
    otpEmail,
    otpLoading,
    otpError
  } = useSelector((state) => state.auth);

  // Redirect if successfully registered
  useEffect(() => {
    if (isSuccess && user) {
      navigate('/shop');
    }
  }, [isSuccess, user, navigate]);

  // Start countdown when OTP sent
  useEffect(() => {
    if (otpSent && otpEmail) {
      setCountdown(60); // 60 seconds countdown before can resend
    }
  }, [otpSent, otpEmail]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSendOTP = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      dispatch(setError('Mật khẩu không khớp'));
      return;
    }

    if (password.length < 6) {
      dispatch(setError('Mật khẩu phải có ít nhất 6 ký tự'));
      return;
    }

    // Send OTP to email
    dispatch(sendRegistrationOTP({ email, username, password }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    if (!otpSent) {
      // Nếu chưa gửi OTP, gọi hàm gửi OTP
      onSendOTP(e);
      return;
    }

    if (!otp || otp.length !== 6) {
      dispatch(setError('Vui lòng nhập mã OTP 6 số'));
      return;
    }

    dispatch(verifyRegistrationOTP({ email: otpEmail || email, otp }));
  };

  const onResendOTP = (e) => {
    e.preventDefault();
    if (countdown > 0) return;
    
    dispatch(resendRegistrationOTP(otpEmail || email));
    setCountdown(60);
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
  };

  return (
    <>
      {/* Inject custom CSS */}
      <style>{aquaticStyles}</style>

      <div className="min-h-screen relative flex overflow-hidden font-sans">
        {/* Fullscreen Aquarium Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1535591273668-578e31182c4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80" 
            alt="Tropical Fish Aquarium" 
            className="w-full h-full object-cover"
          />
          {/* Dark Blue/Cyan Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-cyan-900/70 to-blue-900/75" />
          
          {/* --- Integrated Bubbles Effect --- */}
          <Bubbles />
        </div>

        {/* Content Container - Improved Centering */}
        <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-16 px-4 sm:px-8 lg:px-20 xl:px-32 py-12">
          
          {/* Hero Text - Left Side (animated fade-in from left) */}
          <div className="w-full lg:w-1/2 lg:flex-shrink-0 animate-fade-in-left z-10">
            <div className="max-w-2xl space-y-6 animate-float">
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
          <div className="w-full lg:w-1/2 flex justify-center animate-slide-in-right z-10">
            <div className="w-full max-w-2xl animate-float">
              {/* Extra Large Glassmorphism Card */}
              <div className="backdrop-blur-2xl bg-white/10 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/20 p-8 sm:p-12 lg:p-14">
              
              <form className="space-y-5" onSubmit={onSubmit}>
                {/* Error Message */}
                {(isError || otpError) && (
                  <div className="rounded-xl bg-red-500/80 backdrop-blur-sm p-4 border border-red-400/30 animate-shake">
                    <p className="text-sm text-white font-medium">{otpError || message}</p>
                  </div>
                )}

                {/* Success Message */}
                {message && !isError && !otpError && (
                  <div className="rounded-xl bg-green-500/80 backdrop-blur-sm p-4 border border-green-400/30">
                    <p className="text-sm text-white font-medium">{message}</p>
                  </div>
                )}

                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                    Tên người dùng
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute id-y-0 left-0 pl-4 h-full w-9 text-white/60" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={onChange}
                      className="appearance-none block w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                      placeholder="Nhập tên người dùng"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                    Email
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute id-y-0 left-0 pl-4 h-full w-9 text-white/60" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={onChange}
                      className="appearance-none block w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                      placeholder="Nhập email của bạn"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute id-y-0 left-0 pl-4 h-full w-9 text-white/60" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={onChange}
                      className="appearance-none block w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                      placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-white/60 hover:text-white transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-white/60 hover:text-white transition-colors" />
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
                    <LockClosedIcon className="absolute id-y-0 left-0 pl-4 h-full w-9 text-white/60" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={onChange}
                      className="appearance-none block w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                      placeholder="Xác nhận mật khẩu của bạn"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-white/60 hover:text-white transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-white/60 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                {/* OTP Field - Only shown after OTP sent */}
                {otpSent && (
                  <div className="pt-2 animate-fade-in">
                    <label htmlFor="otp" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                      Mã OTP <span className="text-cyan-300">(đã gửi đến {otpEmail || email})</span>
                    </label>
                    <div className="space-y-2">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        maxLength="6"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="appearance-none block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-center text-xl font-bold tracking-[0.3em] placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="000000"
                        autoComplete="off"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <p className="text-white/70">
                          ⏰ Mã OTP có hiệu lực trong 5 phút
                        </p>
                        {countdown > 0 ? (
                          <p className="text-white/70">
                            Gửi lại sau <span className="font-bold text-cyan-300">{countdown}s</span>
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={onResendOTP}
                            disabled={otpLoading}
                            className="text-cyan-300 hover:text-cyan-200 font-semibold hover:underline transition-all duration-300 disabled:opacity-50"
                          >
                            {otpLoading ? 'Đang gửi...' : '🔄 Gửi lại OTP'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button - with Aquatic Wave Effect */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={otpLoading || (otpSent && otp.length !== 6) || isLoading}
                    className="btn-aquatic w-full flex justify-center py-4 px-6 border border-transparent text-sm font-bold tracking-wider rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                  >
                    {otpLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ĐANG GỬI OTP...
                      </span>
                    ) : isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ĐANG ĐĂNG KÝ...
                      </span>
                    ) : otpSent ? (
                      'ĐĂNG KÝ'
                    ) : (
                      'GỬI MÃ OTP'
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 backdrop-blur-xl bg-white/5 text-white/80 font-medium">hoặc</span>
                  </div>
                </div>

                {/* Google Login Button */}
                <div className="flex justify-center relative z-50">
                  <button
                    type="button"
                    onClick={() => {
                      document.querySelector('[role="button"]')?.click();
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white hover:bg-gray-100 text-gray-700 font-bold tracking-wider rounded-xl border border-gray-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 shadow-md"
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
                  <span className="text-sm text-white/70">Đã có tài khoản? </span>
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
    </>
  );
};

export default Register;