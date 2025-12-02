import rateLimit from 'express-rate-limit';

// Rate limiter cho login/register
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 lần đăng nhập/đăng ký mỗi 15 phút
  message: {
    success: false,
    message: 'Quá nhiều lần đăng nhập/đăng ký, vui lòng thử lại sau 15 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Chỉ tính request thất bại
});
