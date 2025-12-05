import express from 'express';
import {
  createOrder,
  previewOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  vnpayReturn,
  simulateVNPayPayment,
  getAllOrders,
  updateOrderStatus,
  getOrderStatistics,
} from '../controllers/orderController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// ========== PUBLIC ROUTES ==========
// VNPay return URL (public)
router.get('/payment/vnpay/return', vnpayReturn);

// Lấy tất cả đơn hàng (Admin)
router.get('/admin/all', authenticateUser, authorizeRoles('admin'),getAllOrders);

// Thống kê đơn hàng (Admin)
router.get('/admin/statistics', authenticateUser, authorizeRoles('admin'), getOrderStatistics);

// Cập nhật trạng thái đơn hàng (Admin)
router.patch('/admin/:id/status',authenticateUser,authorizeRoles('admin'),updateOrderStatus);

// ========== user ROUTES ==========
// Xem trước đơn hàng (preview trước khi đặt) - ĐẶT TRƯỚC /
router.get('/preview', authenticateUser, previewOrder);

// Tạo đơn hàng mới
router.post('/', authenticateUser, createOrder);

// Lấy danh sách đơn hàng của user
router.get('/', authenticateUser, getUserOrders);

// Simulate VNPay payment success (for testing)
router.post('/:id/payment/vnpay/simulate', authenticateUser, simulateVNPayPayment);

// Hủy đơn hàng
router.patch('/:id/cancel', authenticateUser, cancelOrder);

// Lấy chi tiết đơn hàng - ĐẶT CUỐI CÙNG
router.get('/:id', authenticateUser, getOrderById);

export default router;