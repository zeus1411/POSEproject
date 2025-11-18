import express from 'express';
import {
  createOrder,
  previewOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  processStripePayment,
  stripeWebhook,
  createVNPayPayment,
  vnpayReturn,
  simulateVNPayPayment,
  getAllOrders,
  updateOrderStatus,
  getOrderStatistics,
} from '../controllers/orderController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// ========== PUBLIC ROUTES ==========
// Webhook từ Stripe (không cần auth)
router.post(
  '/payment/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// VNPay return URL (public)
router.get('/payment/vnpay/return', vnpayReturn);

// ========== admin ROUTES (ĐẶT TRƯỚC ĐỂ TRÁNH CONFLICT) ==========
// Lấy tất cả đơn hàng (Admin)
router.get(
  '/admin/all',
  authenticateUser,
  authorizeRoles('admin'),
  getAllOrders
);

// Thống kê đơn hàng (Admin)
router.get(
  '/admin/statistics',
  authenticateUser,
  authorizeRoles('admin'),
  getOrderStatistics
);

// Cập nhật trạng thái đơn hàng (Admin)
router.patch(
  '/admin/:id/status',
  authenticateUser,
  authorizeRoles('admin'),
  updateOrderStatus
);

// Xem chi tiết một đơn hàng (Admin)
router.get(
  '/admin/:id',
  authenticateUser,
  authorizeRoles('admin'),
  getOrderById
);

// ========== user ROUTES ==========
// Xem trước đơn hàng (preview trước khi đặt) - ĐẶT TRƯỚC /
router.get('/preview', authenticateUser, previewOrder);

// Tạo đơn hàng mới
router.post('/', authenticateUser, createOrder);

// Lấy danh sách đơn hàng của user
router.get('/', authenticateUser, getUserOrders);

// VNPay payment URL
router.post('/:id/payment/vnpay', authenticateUser, createVNPayPayment);

// ✅ Simulate VNPay payment success (for testing)
router.post('/:id/payment/vnpay/simulate', authenticateUser, simulateVNPayPayment);

// Hủy đơn hàng
router.patch('/:id/cancel', authenticateUser, cancelOrder);

// Xử lý thanh toán Stripe
router.post('/:id/payment/stripe', authenticateUser, processStripePayment);

// Lấy chi tiết đơn hàng - ĐẶT CUỐI CÙNG
router.get('/:id', authenticateUser, getOrderById);

export default router;