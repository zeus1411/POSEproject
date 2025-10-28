import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errorHandler.js';
import mongoose from 'mongoose';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Tạo đơn hàng mới từ giỏ hàng
// @route   POST /api/orders
// @access  Private (User)
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      shippingAddress, 
      paymentMethod = 'COD',
      promotionCode,
      notes 
    } = req.body;

    const userId = req.user.userId;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.street || !shippingAddress.ward || 
        !shippingAddress.district || !shippingAddress.city) {
      throw new BadRequestError('Vui lòng cung cấp đầy đủ thông tin địa chỉ giao hàng');
    }

    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng');
    }

    // Kiểm tra tồn kho và chuẩn bị items cho order
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.productId;
      
      if (!product) {
        throw new BadRequestError(`Sản phẩm không tồn tại`);
      }

      if (!product.isActive) {
        throw new BadRequestError(`Sản phẩm "${product.name}" hiện không khả dụng`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestError(
          `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm trong kho`
        );
      }

      const itemPrice = product.salePrice || product.price;
      const itemDiscount = product.discount || 0;
      const itemSubtotal = itemPrice * item.quantity * (1 - itemDiscount / 100);

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.images && product.images.length > 0 ? product.images[0] : '',
        sku: product.sku,
        quantity: item.quantity,
        price: itemPrice,
        discount: itemDiscount,
        subtotal: itemSubtotal
      });

      subtotal += itemSubtotal;

      // Giảm stock
      product.stock -= item.quantity;
      product.sold = (product.sold || 0) + item.quantity;
      await product.save({ session });
    }

    // Tính phí ship (logic đơn giản, có thể phức tạp hơn)
    const shippingFee = subtotal >= 500000 ? 0 : 30000;

    // Xử lý mã giảm giá (nếu có)
    let discount = 0;
    let promotionId = null;
    
    if (promotionCode) {
      const Promotion = mongoose.model('Promotion');
      const promotion = await Promotion.findOne({ 
        code: promotionCode,
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });

      if (promotion && subtotal >= promotion.minPurchase) {
        if (promotion.discountType === 'PERCENTAGE') {
          discount = Math.min(
            (subtotal * promotion.discountValue) / 100,
            promotion.maxDiscount || Infinity
          );
        } else {
          discount = promotion.discountValue;
        }
        promotionId = promotion._id;
      }
    }

    const tax = 0; // Có thể tính thuế nếu cần
    const totalPrice = subtotal + shippingFee + tax - discount;

    // Tạo đơn hàng
    const order = await Order.create([{
      userId,
      items: orderItems,
      subtotal,
      shippingFee,
      discount,
      tax,
      totalPrice,
      status: 'PENDING',
      shippingAddress,
      promotionId,
      promotionCode,
      notes,
      isPaid: false
    }], { session });

    // Tạo payment record
    const payment = await Payment.create([{
      orderId: order[0]._id,
      userId,
      method: paymentMethod,
      status: 'PENDING_PAYMENT',
      amount: totalPrice,
      currency: 'VND'
    }], { session });

    // Cập nhật orderId vào order
    order[0].paymentId = payment[0]._id;
    await order[0].save({ session });

    // Xóa giỏ hàng
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { session }
    );

    // Tạo thông báo
    await Notification.createOrderNotification(
      userId,
      order[0]._id,
      'PENDING',
      `Đơn hàng ${order[0].orderNumber} đã được tạo thành công`
    );

    await session.commitTransaction();

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Đơn hàng đã được tạo thành công',
      data: {
        order: order[0],
        payment: payment[0]
      }
    });

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// @desc    Lấy thông tin xem trước đơn hàng (trước khi đặt)
// @route   GET /api/orders/preview
// @access  Private (User)
const previewOrder = async (req, res) => {
  const userId = req.user.userId;
  const { promotionCode } = req.query;

  // Lấy thông tin user
  const user = await User.findById(userId).select('username email phone defaultAddress');
  
  if (!user) {
    throw new NotFoundError('Không tìm thấy thông tin người dùng');
  }

  // Lấy giỏ hàng
  const cart = await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    select: 'name price salePrice discount images sku stock isActive'
  });

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError('Giỏ hàng trống');
  }

  // Tính toán
  let subtotal = 0;
  const items = [];

  for (const item of cart.items) {
    const product = item.productId;
    
    if (!product || !product.isActive) {
      continue;
    }

    const itemPrice = product.salePrice || product.price;
    const itemDiscount = product.discount || 0;
    const itemSubtotal = itemPrice * item.quantity * (1 - itemDiscount / 100);

    items.push({
      productId: product._id,
      productName: product.name,
      productImage: product.images && product.images.length > 0 ? product.images[0] : '',
      sku: product.sku,
      quantity: item.quantity,
      price: itemPrice,
      discount: itemDiscount,
      subtotal: itemSubtotal,
      stock: product.stock
    });

    subtotal += itemSubtotal;
  }

  const shippingFee = subtotal >= 500000 ? 0 : 30000;

  // Xử lý mã giảm giá
  let discount = 0;
  let promotionDetails = null;

  if (promotionCode) {
    const Promotion = mongoose.model('Promotion');
    const promotion = await Promotion.findOne({ 
      code: promotionCode,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (promotion) {
      if (subtotal >= promotion.minPurchase) {
        if (promotion.discountType === 'PERCENTAGE') {
          discount = Math.min(
            (subtotal * promotion.discountValue) / 100,
            promotion.maxDiscount || Infinity
          );
        } else {
          discount = promotion.discountValue;
        }
        promotionDetails = {
          code: promotion.code,
          description: promotion.description,
          discountValue: promotion.discountValue,
          discountType: promotion.discountType
        };
      } else {
        promotionDetails = {
          error: `Đơn hàng tối thiểu ${promotion.minPurchase.toLocaleString('vi-VN')}₫ để áp dụng mã`
        };
      }
    } else {
      promotionDetails = {
        error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn'
      };
    }
  }

  const totalPrice = subtotal + shippingFee - discount;

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      user: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        defaultAddress: user.defaultAddress
      },
      items,
      subtotal,
      shippingFee,
      discount,
      totalPrice,
      promotion: promotionDetails
    }
  });
};

// @desc    Lấy danh sách đơn hàng của user
// @route   GET /api/orders
// @access  Private (User)
const getUserOrders = async (req, res) => {
  const userId = req.user.userId;
  const { status, page = 1, limit = 10 } = req.query;

  const query = { userId };
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .populate('items.productId', 'name images')
    .populate('paymentId', 'method status');

  const total = await Order.countDocuments(query);

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
};

// @desc    Lấy chi tiết đơn hàng
// @route   GET /api/orders/:id
// @access  Private (User/Admin)
const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const order = await Order.findById(id)
    .populate('items.productId', 'name images sku')
    .populate('paymentId')
    .populate('userId', 'username email phone');

  if (!order) {
    throw new NotFoundError('Không tìm thấy đơn hàng');
  }

  // Check ownership
  if (userRole !== 'ADMIN' && order.userId._id.toString() !== userId) {
    throw new UnauthorizedError('Bạn không có quyền xem đơn hàng này');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: { order }
  });
};

// @desc    Hủy đơn hàng
// @route   PATCH /api/orders/:id/cancel
// @access  Private (User)
const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.userId;

    const order = await Order.findById(id).session(session);

    if (!order) {
      throw new NotFoundError('Không tìm thấy đơn hàng');
    }

    // Check ownership
    if (order.userId.toString() !== userId) {
      throw new UnauthorizedError('Bạn không có quyền hủy đơn hàng này');
    }

    // Chỉ cho phép hủy các đơn hàng chưa xử lý hoặc đang xử lý
    if (!['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)) {
      throw new BadRequestError('Không thể hủy đơn hàng ở trạng thái hiện tại');
    }

    // Hoàn stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId).session(session);
      if (product) {
        product.stock += item.quantity;
        product.sold = Math.max(0, (product.sold || 0) - item.quantity);
        await product.save({ session });
      }
    }

    // Cập nhật order
    await order.cancelOrder(reason, userId);

    // Cập nhật payment
    const payment = await Payment.findById(order.paymentId).session(session);
    if (payment && payment.status !== 'COMPLETED') {
      payment.status = 'CANCELLED';
      await payment.save({ session });
    }

    // Tạo thông báo
    await Notification.createOrderNotification(
      userId,
      order._id,
      'CANCELLED',
      `Đơn hàng ${order.orderNumber} đã bị hủy`
    );

    await session.commitTransaction();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đơn hàng đã được hủy thành công',
      data: { order }
    });

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// @desc    Xử lý thanh toán Stripe
// @route   POST /api/orders/:id/payment/stripe
// @access  Private (User)
const processStripePayment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const order = await Order.findById(id);

  if (!order) {
    throw new NotFoundError('Không tìm thấy đơn hàng');
  }

  if (order.userId.toString() !== userId) {
    throw new UnauthorizedError('Bạn không có quyền thanh toán đơn hàng này');
  }

  if (order.isPaid) {
    throw new BadRequestError('Đơn hàng đã được thanh toán');
  }

  const payment = await Payment.findById(order.paymentId);

  if (!payment || payment.method !== 'STRIPE') {
    throw new BadRequestError('Phương thức thanh toán không hợp lệ');
  }

  try {
    // Tạo Payment Intent với Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Stripe tính bằng cents
      currency: 'vnd',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: userId
      }
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });

  } catch (error) {
    throw new BadRequestError('Không thể tạo thanh toán: ' + error.message);
  }
};

// @desc    Xác nhận thanh toán Stripe (webhook)
// @route   POST /api/orders/payment/stripe/webhook
// @access  Public (Stripe webhook)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Xử lý các event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    const order = await Order.findById(orderId);
    const payment = await Payment.findById(order.paymentId);

    if (payment) {
      await payment.markAsCompleted({
        transactionId: paymentIntent.id,
        stripeDetails: {
          paymentIntentId: paymentIntent.id,
          chargeId: paymentIntent.charges.data[0]?.id
        }
      });

      // Tạo thông báo
      await Notification.createPaymentNotification(
        order.userId,
        order._id,
        'COMPLETED',
        `Thanh toán cho đơn hàng ${order.orderNumber} thành công`
      );
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    const order = await Order.findById(orderId);
    const payment = await Payment.findById(order.paymentId);

    if (payment) {
      await payment.markAsFailed('Thanh toán thất bại');

      await Notification.createPaymentNotification(
        order.userId,
        order._id,
        'FAILED',
        `Thanh toán cho đơn hàng ${order.orderNumber} thất bại`
      );
    }
  }

  res.json({ received: true });
};

// @desc    Xử lý thanh toán VNPay (tạo payment URL)
// @route   POST /api/orders/:id/payment/vnpay
// @access  Private (User)
const createVNPayPayment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const order = await Order.findById(id);

  if (!order) {
    throw new NotFoundError('Không tìm thấy đơn hàng');
  }

  if (order.userId.toString() !== userId) {
    throw new UnauthorizedError('Bạn không có quyền thanh toán đơn hàng này');
  }

  if (order.isPaid) {
    throw new BadRequestError('Đơn hàng đã được thanh toán');
  }

  const payment = await Payment.findById(order.paymentId);

  if (!payment || payment.method !== 'VNPAY') {
    throw new BadRequestError('Phương thức thanh toán không hợp lệ');
  }

  // Logic tạo VNPay payment URL (cần implement đầy đủ theo docs VNPay)
  // Đây là version đơn giản
  const vnpUrl = process.env.VNPAY_URL;
  const vnpTmnCode = process.env.VNPAY_TMN_CODE;
  const vnpHashSecret = process.env.VNPAY_HASH_SECRET;
  const returnUrl = `${process.env.CLIENT_URL}/orders/${id}/payment/vnpay/return`;

  const vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpTmnCode,
    vnp_Amount: order.totalPrice * 100,
    vnp_CreateDate: new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14),
    vnp_CurrCode: 'VND',
    vnp_IpAddr: req.ip,
    vnp_Locale: 'vn',
    vnp_OrderInfo: `Thanh toan don hang ${order.orderNumber}`,
    vnp_OrderType: 'other',
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: order.orderNumber
  };

  // Sort và tạo query string (cần implement hash)
  const paymentUrl = `${vnpUrl}?${new URLSearchParams(vnpParams).toString()}`;

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      paymentUrl
    }
  });
};

// @desc    Xác nhận thanh toán VNPay (return URL)
// @route   GET /api/orders/payment/vnpay/return
// @access  Public
const vnpayReturn = async (req, res) => {
  const vnpParams = req.query;

  // Verify signature (cần implement)
  const isValid = true; // Placeholder

  if (isValid && vnpParams.vnp_ResponseCode === '00') {
    const orderNumber = vnpParams.vnp_TxnRef;
    const order = await Order.findOne({ orderNumber });
    const payment = await Payment.findById(order.paymentId);

    if (payment) {
      await payment.markAsCompleted({
        transactionId: vnpParams.vnp_TransactionNo,
        vnpayDetails: {
          vnp_TxnRef: vnpParams.vnp_TxnRef,
          vnp_BankCode: vnpParams.vnp_BankCode,
          vnp_TransactionNo: vnpParams.vnp_TransactionNo,
          vnp_ResponseCode: vnpParams.vnp_ResponseCode
        }
      });

      await Notification.createPaymentNotification(
        order.userId,
        order._id,
        'COMPLETED',
        `Thanh toán cho đơn hàng ${order.orderNumber} thành công`
      );
    }

    res.redirect(`${process.env.CLIENT_URL}/orders/${order._id}?payment=success`);
  } else {
    res.redirect(`${process.env.CLIENT_URL}/orders?payment=failed`);
  }
};

// ========== ADMIN ROUTES ==========

// @desc    Lấy tất cả đơn hàng (Admin)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;

  const query = {};
  if (status) {
    query.status = status;
  }
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
    ];
  }

  const orders = await Order.find(query)
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .populate('userId', 'username email phone')
    .populate('paymentId', 'method status');

  const total = await Order.countDocuments(query);

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
};

// @desc    Cập nhật trạng thái đơn hàng (Admin)
// @route   PATCH /api/orders/admin/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note, trackingNumber, shippingProvider } = req.body;
  const adminId = req.user.userId;

  const order = await Order.findById(id);

  if (!order) {
    throw new NotFoundError('Không tìm thấy đơn hàng');
  }

  // Validate status transition
  const validTransitions = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['PROCESSING', 'CANCELLED'],
    'PROCESSING': ['SHIPPING', 'CANCELLED'],
    'SHIPPING': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': ['REFUNDED'],
    'CANCELLED': [],
    'REFUNDED': [],
    'FAILED': []
  };

  if (!validTransitions[order.status].includes(status)) {
    throw new BadRequestError(
      `Không thể chuyển từ trạng thái ${order.status} sang ${status}`
    );
  }

  // Cập nhật order
  await order.updateStatus(status, note, adminId);

  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }
  if (shippingProvider) {
    order.shippingProvider = shippingProvider;
  }

  await order.save();

  // Tạo thông báo cho user
  await Notification.createOrderNotification(
    order.userId,
    order._id,
    status,
    note || `Đơn hàng ${order.orderNumber} đã được cập nhật sang trạng thái ${status}`
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cập nhật trạng thái đơn hàng thành công',
    data: { order }
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
        createdAt: { $gte: start, $lte: end }
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

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      overall: stats,
      byStatus: statusStats
    }
  });
};

export {
  createOrder,
  previewOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  processStripePayment,
  stripeWebhook,
  createVNPayPayment,
  vnpayReturn,
  getAllOrders,
  updateOrderStatus,
  getOrderStatistics
};