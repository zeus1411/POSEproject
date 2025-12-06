import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errorHandler.js';
import mongoose from 'mongoose';
import { calculateShippingFee } from '../utils/shippingCalculator.js';

import { buildVNPayUrl, verifyVNPayReturn } from '../services/vnpayService.js';
import { getTempOrder, removeTempOrder } from '../utils/tempOrderStorage.js';
import orderService from '../services/orderService.js';

// @desc    Tạo đơn hàng mới từ giỏ hàng
// @route   POST /api/orders
// @access  Private (User)
const createOrder = async (req, res) => {
  const { 
    shippingAddress, 
    paymentMethod = 'COD',
    promotionCode,
    promotionCodes,
    notes 
  } = req.body;

  const userId = req.user.userId;

  const result = await orderService.createOrder(userId, {
    shippingAddress,
    paymentMethod,
    promotionCode,
    promotionCodes: promotionCodes || (promotionCode ? [promotionCode] : []),
    notes
  }, req);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: paymentMethod === 'VNPAY' 
      ? 'Dữ liệu đơn hàng đã được chuẩn bị. Vui lòng thanh toán để hoàn tất'
      : 'Đơn hàng đã được tạo thành công',
    data: result
  });
};

// @desc    Lấy thông tin xem trước đơn hàng (trước khi đặt)
// @route   GET /api/orders/preview
// @access  Private (User)
const previewOrder = async (req, res) => {
  const userId = req.user.userId;
  const { promotionCode, promotionCodes } = req.query;

  const result = await orderService.getOrderPreview(userId, promotionCode, promotionCodes);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result
  });
};

// @desc    Lấy danh sách đơn hàng của user
// @route   GET /api/orders
// @access  Private (User)
const getUserOrders = async (req, res) => {
  const userId = req.user.userId;
  const { status, page = 1, limit = 10 } = req.query;

  const result = await orderService.getUserOrders(userId, { status, page, limit });

  res.status(StatusCodes.OK).json({
    success: true,
    data: result
  });
};

// @desc    Lấy chi tiết đơn hàng
// @route   GET /api/orders/:id
// @access  Private (User/Admin)
const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const order = await orderService.getOrderById(id, userId, userRole);

  res.status(StatusCodes.OK).json({
    success: true,
    data: { order }
  });
};

// @desc    Hủy đơn hàng
// @route   PATCH /api/orders/:id/cancel
// @access  Private (User)
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = req.body?.reason || 'Không có lý do';
    const userId = req.user.userId;

    const populatedOrder = await orderService.cancelOrder(id, userId, reason);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đơn hàng đã được hủy thành công',
      data: { order: populatedOrder }
    });

  } catch (error) {
    console.error('❌ Error in cancelOrder:', error.message);
    
    const statusCode = error.statusCode || 
      (error.name === 'NotFoundError' ? StatusCodes.NOT_FOUND : 
       error.name === 'UnauthorizedError' ? StatusCodes.UNAUTHORIZED : 
       error.name === 'BadRequestError' ? StatusCodes.BAD_REQUEST : 
       StatusCodes.INTERNAL_SERVER_ERROR);
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Có lỗi xảy ra khi hủy đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    VNPay redirect về backend sau khi thanh toán
// @route   GET /api/v1/orders/payment/vnpay/return
// @access  Public
const vnpayReturn = async (req, res) => {
  const vnpParams = req.query;

  const result = await orderService.processVNPayReturn(vnpParams);

  return res.redirect(result.redirectUrl);
};

// @desc    Simulate VNPay payment success (for testing)
// @route   POST /api/orders/:id/payment/vnpay/simulate
// @access  Private
const simulateVNPayPayment = async (req, res) => {
  const { id: transactionId } = req.params;
  const { responseCode = '00' } = req.body;
  const userId = req.user.userId;

  const result = await orderService.simulateVNPayPayment(transactionId, userId, responseCode);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Thanh toán VNPay đã được mô phỏng thành công',
    data: result
  });
};

// ========== admin ROUTES ==========

// @desc    Lấy tất cả đơn hàng (Admin)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 10, search } = req.query;

  const result = await orderService.getAllOrders({ status, page, limit, search });

  res.status(StatusCodes.OK).json({
    success: true,
    data: result
  });
};

// @desc    Cập nhật trạng thái đơn hàng (Admin)
// @route   PATCH /api/orders/admin/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note, trackingNumber, shippingProvider } = req.body;
  const adminId = req.user.userId;

  const updatedOrder = await orderService.updateOrderStatus(
    id,
    { status, note, trackingNumber, shippingProvider },
    adminId
  );

  res.status(StatusCodes.OK).json({
    success: true,
    data: updatedOrder
  });
};

// @desc    Thống kê đơn hàng (Admin)
// @route   GET /api/orders/admin/statistics
// @access  Private (Admin)
const getOrderStatistics = async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const stats = await Order.getStatistics(start, end);

  // Thống kê theo trạng thái
  const statusStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $ne: 'REFUNDED' }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' }
      }
    }
  ]);

  // Thống kê sản phẩm bán chạy nhất
  const topProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['CANCELLED', 'FAILED'] }
      }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.productId',
        productName: { $first: '$items.productName' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $sort: { totalQuantity: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Thống kê doanh thu theo ngày
  const dailyRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['CANCELLED', 'FAILED'] }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Thống kê phương thức thanh toán
  const paymentMethodStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $lookup: {
        from: 'payments',
        localField: 'paymentId',
        foreignField: '_id',
        as: 'payment'
      }
    },
    {
      $group: {
        _id: { $arrayElemAt: ['$payment.paymentMethod', 0] },
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' }
      }
    }
  ]);

  // Tổng số khách hàng
  const totalCustomers = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$userId'
      }
    },
    {
      $count: 'total'
    }
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      overall: stats,
      byStatus: statusStats,
      topProducts: topProducts,
      dailyRevenue: dailyRevenue,
      paymentMethods: paymentMethodStats,
      totalCustomers: totalCustomers[0]?.total || 0,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    }
  });
};

export {
  createOrder,
  previewOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  vnpayReturn,
  simulateVNPayPayment,
  getAllOrders,
  updateOrderStatus,
  getOrderStatistics
};