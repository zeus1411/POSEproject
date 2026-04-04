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
import { authenticateUser, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and Payment APIs
 */

/**
 * @swagger
 * /orders/payment/vnpay/return:
 *   get:
 *     summary: VNPay payment return callback
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Payment processing result
 */
router.get('/payment/vnpay/return', vnpayReturn);

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get('/admin/all', authenticateUser, authorizeRoles('admin'), getAllOrders);

/**
 * @swagger
 * /orders/admin/statistics:
 *   get:
 *     summary: Get order statistics (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order stats
 */
router.get('/admin/statistics', authenticateUser, authorizeRoles('admin'), getOrderStatistics);

/**
 * @swagger
 * /orders/admin/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/admin/:id/status', authenticateUser, authorizeRoles('admin'), updateOrderStatus);

/**
 * @swagger
 * /orders/preview:
 *   get:
 *     summary: Preview order before checkout
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order preview data
 */
router.get('/preview', authenticateUser, previewOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/', authenticateUser, createOrder);
router.get('/', authenticateUser, getUserOrders);

/**
 * @swagger
 * /orders/{id}/payment/vnpay/simulate:
 *   post:
 *     summary: Simulate VNPay payment success (Testing)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment simulated
 */
router.post('/:id/payment/vnpay/simulate', authenticateUser, simulateVNPayPayment);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.patch('/:id/cancel', authenticateUser, cancelOrder);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', authenticateUser, getOrderById);

export default router;
