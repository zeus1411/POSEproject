import rateLimit from 'express-rate-limit';

// Rate limiter chung cho tất cả requests
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 requests mỗi 15 phút
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter nghiêm ngặt hơn cho các route nhạy cảm (auth, checkout...)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 requests mỗi 15 phút
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Tính cả request thành công
});

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

// Rate limiter cho tạo đơn hàng
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 đơn hàng mỗi 15 phút
  message: {
    success: false,
    message: 'Bạn đã tạo quá nhiều đơn hàng, vui lòng thử lại sau 15 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho upload files
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // Giới hạn 10 lần upload mỗi 15 phút
  message: {
    success: false,
    message: 'Quá nhiều lần upload file, vui lòng thử lại sau 15 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho API công khai (search, get products...)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 150, // Giới hạn 150 requests mỗi 15 phút cho API công khai
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
