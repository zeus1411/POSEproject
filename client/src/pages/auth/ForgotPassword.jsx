import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  // Countdown timer for OTP expiration
  useEffect(() => {
    let timer;
    if (otpSent && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, timeRemaining]);

  // Format time remaining as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.sendOTP(email);
      setOtpSent(true);
      setTimeRemaining(300); // Reset to 5 minutes
      setCanResend(false);
      toast.success(response.message || 'Mã OTP đã được gửi đến email của bạn');
    } catch (error) {
      // Exception flow 4.1: Email không tồn tại
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      const response = await authService.resendOTP(email);
      setTimeRemaining(300); // Reset to 5 minutes
      setCanResend(false);
      setOtp(''); // Clear current OTP input
      toast.success(response.message || 'Mã OTP mới đã được gửi đến email của bạn');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể gửi lại OTP. Vui lòng thử lại';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Exception flow 6.1: Mật khẩu không khớp
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.resetPassword(email, otp, newPassword, confirmPassword);
      
      toast.success(response.message || 'Đặt lại mật khẩu thành công! Đang chuyển hướng...');
      
      // Auto-login successful, redirect to shop
      setTimeout(() => {
        navigate('/shop');
      }, 1500);
    } catch (error) {
      // Exception flow 5.1: OTP hết hạn hoặc không hợp lệ
      const errorMessage = error.response?.data?.message || 'Không thể đặt lại mật khẩu';
      toast.error(errorMessage);
      
      // If OTP expired, enable resend
      if (errorMessage.includes('hết hạn') || errorMessage.includes('expired')) {
        setCanResend(true);
        setTimeRemaining(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex overflow-hidden">
      {/* Fullscreen Aquarium Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://res.cloudinary.com/dxtrwinoc/image/upload/v1763903947/Screenshot_2025-11-23_201535_gsanlw.png" 
          alt="Aquatic Plants Tank" 
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
            <p className="text-cyan-300 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase">NÃO CÁ VÀNG?</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-script text-white leading-tight drop-shadow-lg tracking-wide">
              CHUYỆN NHỎ,<br />CHÚNG TÔI SẼ GIÚP BẠN BƠI VỀ NHÀ AN TOÀN
            </h1>
            <p className="text-lg sm:text-xl text-white/95 font-light leading-relaxed">
              Chúng tôi sẽ giúp bạn quay trở lại<br />thế giới thủy sinh.
            </p>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-md">
              Nhập email của bạn và chúng tôi sẽ gửi mã xác minh để đặt lại mật khẩu an toàn.
            </p>
          </div>
        </div>

        {/* Glassmorphism Form Card - Larger & Better Centered (animated slide-in from right) */}
        <div className="w-full lg:w-1/2 flex justify-center animate-slide-in-right">
          <div className="w-full max-w-2xl">
            {/* Extra Large Glassmorphism Card */}
            <div className="backdrop-blur-2xl bg-white/15 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/30 p-8 sm:p-12 lg:p-14">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-extrabold text-white">
            {otpSent ? 'Đặt lại Mật khẩu' : 'Quên mật khẩu?'}
          </h2>
          <p className="mt-3 text-center text-sm text-white/80">
            {otpSent 
              ? 'Nhập mã OTP đã được gửi đến email của bạn và mật khẩu mới.'
              : 'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.'}
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={otpSent ? handleResetPassword : handleSendOTP}>
          {!otpSent ? (
            <div>
              <div>
                <label htmlFor="email-address" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                  Địa chỉ Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* OTP Timer Display */}
              <div className="bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3 text-center">
                <p className="text-sm text-white">
                  {timeRemaining > 0 ? (
                    <>
                      <span className="font-semibold">Mã OTP hết hạn sau:</span>
                      <span className="ml-2 text-lg font-bold text-cyan-300">
                        {formatTime(timeRemaining)}
                      </span>
                    </>
                  ) : (
                    <span className="text-red-300 font-semibold">
                      Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                  Mã OTP <span className="text-red-300">*</span>
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="6"
                  required
                  className="appearance-none block w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 tracking-widest text-center text-lg font-semibold"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-white/60">Nhập mã OTP 6 chữ số từ email</p>
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                  Mật khẩu mới <span className="text-red-300">*</span>
                </label>
                <input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                  Xác nhận mật khẩu <span className="text-red-300">*</span>
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Resend OTP Button */}
              {canResend && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm font-medium text-cyan-300 hover:text-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed underline transition-all duration-300"
                  >
                    {isLoading ? 'Đang gửi...' : '🔄 Gửi lại mã OTP'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || (otpSent && timeRemaining === 0)}
              className="w-full flex justify-center py-4 px-6 border border-transparent text-sm font-bold tracking-wider rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {isLoading 
                ? '⏳ Đang xử lý...' 
                : otpSent 
                  ? '🔒 Đặt lại mật khẩu' 
                  : '📧 Gửi mã OTP'}
            </button>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 hover:underline transition-all duration-300"
            >
              ← Quay lại Đăng nhập
            </Link>
            {otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setTimeRemaining(300);
                  setCanResend(false);
                }}
                className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 hover:underline transition-all duration-300"
                disabled={isLoading}
              >
                📝 Đổi Email
              </button>
            )}
          </div>
        </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;