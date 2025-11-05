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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {otpSent ? 'Đặt lại Mật khẩu' : 'Quên mật khẩu?'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {otpSent 
              ? 'Nhập mã OTP đã được gửi đến email của bạn và mật khẩu mới.'
              : 'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={otpSent ? handleResetPassword : handleSendOTP}>
          {!otpSent ? (
            <div className="rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-center">
                <p className="text-sm text-blue-800">
                  {timeRemaining > 0 ? (
                    <>
                      <span className="font-semibold">Mã OTP hết hạn sau:</span>
                      <span className="ml-2 text-lg font-bold text-blue-600">
                        {formatTime(timeRemaining)}
                      </span>
                    </>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Mã OTP <span className="text-red-500">*</span>
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="6"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm tracking-widest text-center text-lg font-semibold"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">Nhập mã OTP 6 chữ số từ email</p>
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed underline"
                  >
                    {isLoading ? 'Đang gửi...' : '🔄 Gửi lại mã OTP'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || (otpSent && timeRemaining === 0)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading 
                ? '⏳ Đang xử lý...' 
                : otpSent 
                  ? '🔒 Đặt lại mật khẩu' 
                  : '📧 Gửi mã OTP'}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
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
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                disabled={isLoading}
              >
                📝 Đổi Email
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;