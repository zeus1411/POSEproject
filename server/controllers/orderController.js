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

import { buildVNPayUrl, verifyVNPayReturn } from '../services/vnpayService.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Tạo đơn hàng mới từ giỏ hàng
// @route   POST /api/orders
// @access  Private (User)
const createOrder = async (req, res) => {
  // NOTE: Transactions disabled for standalone MongoDB (Docker development)
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    console.log('=== CREATE ORDER ===');
    console.log('User:', req.user);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    const { 
      shippingAddress, 
      paymentMethod = 'COD',
      promotionCode,
      notes 
    } = req.body;

    const userId = req.user.userId;
    
    console.log('UserId:', userId);
    console.log('PaymentMethod:', paymentMethod);

    // Validate shipping address
    if (!shippingAddress) {
      throw new BadRequestError('Thiếu thông tin địa chỉ giao hàng');
    }
    
    const requiredFields = ['fullName', 'phone', 'street', 'ward', 'district', 'city'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field]);
    
    if (missingFields.length > 0) {
      throw new BadRequestError(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
    }

    console.log('Shipping address validated');

    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    console.log('Cart found:', cart ? 'Yes' : 'No');
    console.log('Cart items count:', cart?.items?.length || 0);
    
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng');
    }

    // Kiểm tra tồn kho và chuẩn bị items cho order
    const orderItems = [];
    let subtotal = 0;

    console.log('Processing cart items...');

    for (const item of cart.items) {
      const product = item.productId;
      
      console.log(`Processing product: ${product?._id} - ${product?.name}`);
      
      if (!product) {
        throw new BadRequestError(`Sản phẩm không tồn tại`);
      }

      if (product.status !== 'ACTIVE') {
        throw new BadRequestError(`Sản phẩm "${product.name}" hiện không khả dụng`);
      }

      // Handle variant products
      let itemPrice = product.salePrice || product.price;
      let availableStock = product.stock;
      let selectedVariant = null;
      
      if (product.hasVariants && item.variantId) {
        const variant = product.variants.find(v => v._id.toString() === item.variantId);
        
        if (!variant) {
          throw new BadRequestError(`Biến thể sản phẩm "${product.name}" không tồn tại`);
        }
        
        if (!variant.isActive) {
          throw new BadRequestError(`Biến thể sản phẩm "${product.name}" không khả dụng`);
        }
        
        selectedVariant = variant;
        itemPrice = variant.price;
        availableStock = variant.stock;
      }

      if (availableStock < item.quantity) {
        throw new BadRequestError(
          `Sản phẩm "${product.name}" chỉ còn ${availableStock} sản phẩm trong kho`
        );
      }

      const itemDiscount = product.discount || 0;
      const itemSubtotal = itemPrice * item.quantity * (1 - itemDiscount / 100);

      const firstImage = Array.isArray(product.images) && product.images.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].url || ''))
        : '';

      const orderItem = {
        productId: product._id,
        productName: product.name,
        productImage: firstImage,
        sku: product.sku,
        quantity: item.quantity,
        price: itemPrice,
        discount: itemDiscount,
        subtotal: itemSubtotal
      };
      
      // Add variant info if exists
      if (selectedVariant) {
        orderItem.variantId = item.variantId;
        orderItem.selectedVariant = {
          optionValues: selectedVariant.optionValues,
          price: selectedVariant.price,
          stock: selectedVariant.stock
        };
      }
      
      orderItems.push(orderItem);

      subtotal += itemSubtotal;

      // *** FIX: Cập nhật stock bằng updateOne để tránh validation ***
      if (product.hasVariants && selectedVariant) {
        // Update variant stock
        await Product.updateOne(
          { 
            _id: product._id,
            'variants._id': selectedVariant._id
          },
          {
            $inc: { 
              'variants.$.stock': -item.quantity,
              soldCount: item.quantity 
            }
          }
          // { session } // Disabled for standalone MongoDB
        );
      } else {
        // Update product stock
        await Product.updateOne(
          { _id: product._id },
          {
            $inc: { 
              stock: -item.quantity,
              soldCount: item.quantity 
            }
          }
          // { session } // Disabled for standalone MongoDB
        );
      }
      
      console.log(`Product ${product.name} stock updated`);
    }

    console.log('Order items prepared:', orderItems.length);
    console.log('Subtotal:', subtotal);

    // Tính phí ship
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    console.log('Shipping fee:', shippingFee);

    // Xử lý mã giảm giá (nếu có)
    let discount = 0;
    let promotionId = null;
    
    if (promotionCode) {
      console.log('Processing promotion code:', promotionCode);
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
        console.log('Promotion applied:', discount);
      }
    }

    const tax = 0;
    const totalPrice = subtotal + shippingFee + tax - discount;
    
    console.log('Total price:', totalPrice);

    // Tạo đơn hàng
    console.log('Creating order...');
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
    }]); // session disabled for standalone MongoDB

    console.log('Order created:', order[0]._id, order[0].orderNumber);

    // Handle VNPay payment
    if (paymentMethod === 'VNPAY') {
      console.log('Processing VNPay payment...');
      
      // Create a payment record
      const payment = await Payment.create([{
        orderId: order[0]._id,
        userId,
        method: 'VNPAY',
        status: 'PENDING_PAYMENT',
        amount: totalPrice,
        currency: 'VND',
        transactionId: `VNPAY-${Date.now()}`
      }]); // session disabled for standalone MongoDB

      console.log('Payment record created:', payment[0]._id);

      // Generate VNPay URL
      console.log('Building VNPay URL...');
      const vnpayUrl = await buildVNPayUrl({
        order: {
          ...order[0].toObject(),
          orderNumber: order[0].orderNumber,
          totalPrice: order[0].totalPrice
        },
        payment: {
          _id: payment[0]._id,
          transactionId: payment[0].transactionId
        },
        ipAddr: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      });

      console.log('VNPay URL generated:', vnpayUrl);

      // Lưu payment vào order
      order[0].paymentId = payment[0]._id;
      await order[0].save(); // session disabled for standalone MongoDB

      // Xóa giỏ hàng
      await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } }
        // { session } // Disabled for standalone MongoDB
      );

      console.log('Cart cleared');

      // ✅ Commit transaction TRƯỚC - không chờ notification
      // await session.commitTransaction(); // Disabled for standalone MongoDB
      // session.endSession(); // Disabled for standalone MongoDB

      console.log('Transaction committed - VNPay order');

      // ✅ Gửi notification ASYNC sau khi commit (không chặn response)
      setImmediate(async () => {
        try {
          await Notification.createOrderNotification(
            userId,
            order[0]._id,
            'PENDING',
            `Đơn hàng ${order[0].orderNumber} đã được tạo thành công`
          );
          console.log('✅ Notification sent (VNPay order)');
        } catch (notifError) {
          console.error('❌ Notification failed (non-critical):', notifError.message);
        }
      });

      console.log('===================\n');

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Đơn hàng đã được tạo. Chuyển hướng đến trang thanh toán VNPay',
        data: {
          order: order[0],
          payment: payment[0],
          paymentUrl: vnpayUrl
        }
      });

    }

    // COD Payment
    console.log('Processing COD payment...');
    
    const payment = await Payment.create([{
      orderId: order[0]._id,
      userId,
      method: paymentMethod,
      status: 'PENDING_PAYMENT',
      amount: totalPrice,
      currency: 'VND'
    }]); // session disabled for standalone MongoDB

    console.log('Payment record created:', payment[0]._id);

    // Cập nhật paymentId vào order
    order[0].paymentId = payment[0]._id;
    await order[0].save(); // session disabled for standalone MongoDB

    // Xóa giỏ hàng
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } }
      // { session } // Disabled for standalone MongoDB
    );

    console.log('Cart cleared');

    // ✅ Commit transaction TRƯỚC - không chờ notification
    // await session.commitTransaction(); // Disabled for standalone MongoDB

    console.log('Transaction committed - COD order');

    // ✅ Gửi notification ASYNC sau khi commit (không chặn response)
    const orderId = order[0]._id;
    const orderNumber = order[0].orderNumber;
    setImmediate(async () => {
      try {
        await Notification.createOrderNotification(
          userId,
          orderId,
          'PENDING',
          `Đơn hàng ${orderNumber} đã được tạo thành công`
        );
        console.log('✅ Notification sent (COD order)');
      } catch (notifError) {
        console.error('❌ Notification failed (non-critical):', notifError.message);
      }
    });

    console.log('===================\n');

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Đơn hàng đã được tạo thành công',
      data: {
        order: order[0],
        payment: payment[0]
      }
    });

  } catch (error) {
    // await session.abortTransaction(); // Disabled for standalone MongoDB
    console.error('Order creation failed:', error.message);
    console.error('Stack:', error.stack);
    console.error('===================\n');
    throw error;
  } finally {
    // session.endSession(); // Disabled for standalone MongoDB
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
    select: 'name price salePrice discount images sku stock status'
  });

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError('Giỏ hàng trống');
  }

  // Tính toán
  let subtotal = 0;
  const items = [];

  for (const item of cart.items) {
    const product = item.productId;
    
    if (!product || product.status !== 'ACTIVE') {
      continue;
    }

    const itemPrice = product.salePrice || product.price;
    const itemDiscount = product.discount || 0;
    const itemSubtotal = itemPrice * item.quantity * (1 - itemDiscount / 100);

    const firstImage = Array.isArray(product.images) && product.images.length > 0
      ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].url || ''))
      : '';

    items.push({
      productId: product._id,
      productName: product.name,
      productImage: firstImage,
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
  if (userRole !== 'admin' && order.userId._id.toString() !== userId) {
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
  // NOTE: Transactions disabled for standalone MongoDB (Docker development)
  // const session = await mongoose.startSession();
  // session.startTransaction();
  
  try {
    const { id } = req.params;
    const reason = req.body?.reason || 'Không có lý do';
    const userId = req.user.userId;

    console.time('cancelOrder:findOrder');
    const order = await Order.findById(id)
      .select('status userId items paymentId')
      // .session(session) // Disabled for standalone MongoDB
      .lean();
    console.timeEnd('cancelOrder:findOrder');

    if (!order) {
      throw new NotFoundError('Không tìm thấy đơn hàng');
    }

    // Check ownership
    if (order.userId.toString() !== userId) {
      throw new UnauthorizedError('Bạn không có quyền hủy đơn hàng này');
    }

    // Check cancellable status
    const cancellableStatuses = ['PENDING', 'CONFIRMED', 'FAILED']; // ✅ Bỏ PROCESSING
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestError(
        `Không thể hủy đơn hàng ở trạng thái "${order.status}". Chỉ có thể hủy đơn hàng ở trạng thái: ${cancellableStatuses.join(', ')}`
      );
    }

    // Update order status first to prevent race conditions
    console.time('cancelOrder:updateOrder');
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'CANCELLED',
          cancelReason: reason,
          cancelledAt: new Date(),
          cancelledBy: userId
        }
      },
      { new: true } // session disabled for standalone MongoDB
    ).lean();
    console.timeEnd('cancelOrder:updateOrder');

    // Update product stocks in parallel
    console.time('cancelOrder:updateProducts');
    const productUpdates = order.items.map(item => 
      Product.updateOne(
        { _id: item.productId },
        { 
          $inc: { 
            stock: item.quantity,
            soldCount: -item.quantity 
          } 
        }
        // { session } // Disabled for standalone MongoDB
      )
    );
    await Promise.all(productUpdates);
    console.timeEnd('cancelOrder:updateProducts');

    // Update payment status if exists
    if (order.paymentId) {
      console.time('cancelOrder:updatePayment');
      await Payment.updateOne(
        { _id: order.paymentId, status: { $ne: 'COMPLETED' } },
        { $set: { status: 'CANCELLED' } }
        // { session } // Disabled for standalone MongoDB
      );
      console.timeEnd('cancelOrder:updatePayment');
    }

    // Commit transaction
    // await session.commitTransaction(); // Disabled for standalone MongoDB
    console.log('✅ Transaction committed successfully');

    // Get updated order with populated fields
    console.time('cancelOrder:fetchUpdatedOrder');
    const populatedOrder = await Order.findById(id)
      .populate('items.productId', 'name price images')
      .populate('userId', 'fullName email phoneNumber')
      .populate('paymentId', 'method status')
      .lean();
    console.timeEnd('cancelOrder:fetchUpdatedOrder');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đơn hàng đã được hủy thành công',
      data: { order: populatedOrder }
    });

  } catch (error) {
    // await session.abortTransaction(); // Disabled for standalone MongoDB
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
  } finally {
    // session.endSession(); // Disabled for standalone MongoDB
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

// @desc    Tạo URL thanh toán VNPay cho 1 order
// @route   POST /api/v1/orders/:id/payment/vnpay
// @access  Private (User)
const createVNPayPayment = async (req, res) => {
  const { id } = req.params;           // order id
  const userId = req.user.userId;

  // 1. Lấy order
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

  // 2. Lấy payment tương ứng
  const payment = await Payment.findById(order.paymentId);
  if (!payment) {
    throw new BadRequestError('Không tìm thấy thông tin thanh toán');
  }
  if (payment.method !== 'VNPAY') {
    throw new BadRequestError('Phương thức thanh toán không hợp lệ (không phải VNPay)');
  }

  // 3. Gọi service để build URL thanh toán VNPay đúng chuẩn, có ký hash
  const vnpayResponse = await buildVNPayUrl({
    order,
    payment,
    ipAddr: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
  });

  // vnpayResponse thường sẽ có dạng { redirectUrl: "...", ... }
  // tuỳ lib, có thể là string url luôn. Ta chuẩn hoá trả ra client.
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      paymentUrl: vnpayResponse, 
      // nếu vnpayResponse.redirectUrl tồn tại thì có thể trả redirectUrl thay vì cả object
    }
  });
};

// @desc    VNPay redirect về backend sau khi thanh toán
// @route   GET /api/v1/orders/payment/vnpay/return
// @access  Public
const vnpayReturn = async (req, res) => {
  const vnpParams = req.query;

  // 1. Xác thực chữ ký VNPay trả về
  const verifyResult = verifyVNPayReturn(vnpParams);
  const isValid = verifyResult?.isVerified !== false; // fallback true nếu lib trả true/false

  // 2. Kiểm tra mã phản hồi
  // VNPay chuẩn: vnp_ResponseCode === '00' nghĩa là thành công
  if (isValid && vnpParams.vnp_ResponseCode === '00') {

    // Từ callback, ta lấy ra TxnRef. Ở trên ta set vnp_TxnRef = payment.transactionId || order.orderNumber
    const txnRef = vnpParams.vnp_TxnRef;

    // Tìm payment theo transactionId hoặc theo orderNumber
    let payment = await Payment.findOne({
      $or: [
        { transactionId: txnRef },
        { 'vnpayDetails.vnp_TxnRef': txnRef }
      ]
    });

    // Nếu chưa có, fallback: tìm theo orderNumber (vnp_TxnRef có thể là orderNumber)
    if (!payment && txnRef) {
      const orderByNumber = await Order.findOne({ orderNumber: txnRef });
      if (orderByNumber) {
        payment = await Payment.findById(orderByNumber.paymentId);
      }
    }

    if (payment) {
      const order = await Order.findById(payment.orderId);

      // Đánh dấu thanh toán thành công
      await payment.markAsCompleted({
        transactionId: vnpParams.vnp_TransactionNo,
        vnpayDetails: {
          vnp_TxnRef: vnpParams.vnp_TxnRef,
          vnp_BankCode: vnpParams.vnp_BankCode,
          vnp_CardType: vnpParams.vnp_CardType,
          vnp_TransactionNo: vnpParams.vnp_TransactionNo,
          vnp_PayDate: vnpParams.vnp_PayDate,
          vnp_ResponseCode: vnpParams.vnp_ResponseCode,
          vnp_TransactionStatus: vnpParams.vnp_TransactionStatus,
        },
      });

      // Gửi notification cho user
      await Notification.createPaymentNotification(
        order.userId,
        order._id,
        'COMPLETED',
        `Thanh toán cho đơn hàng ${order.orderNumber} thành công`
      );
      
      // Redirect về FE: success
      return res.redirect(`${process.env.CLIENT_URL}/orders/${order._id}?payment=success`);
    }

    // Nếu vì lý do nào đó không tìm được payment/order
    return res.redirect(`${process.env.CLIENT_URL}/orders?payment=unknown`);
  }

  // Trường hợp chữ ký fail hoặc user cancel / lỗi thanh toán
  return res.redirect(`${process.env.CLIENT_URL}/orders?payment=failed`);
};

// @desc    Simulate VNPay payment success (for testing)
// @route   POST /api/orders/:id/payment/vnpay/simulate
// @access  Private
const simulateVNPayPayment = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { transactionId, responseCode = '00' } = req.body;
    const userId = req.user.userId;

    console.log('🧪 Simulating VNPay payment for order:', orderId);

    // Find order and verify ownership
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Không tìm thấy đơn hàng');
    }

    if (order.userId.toString() !== userId) {
      throw new UnauthorizedError('Không có quyền truy cập đơn hàng này');
    }

    // Find payment
    const payment = await Payment.findOne({
      orderId: order._id,
      transactionId
    });

    if (!payment) {
      throw new NotFoundError('Không tìm thấy thông tin thanh toán');
    }

    if (payment.status === 'COMPLETED') {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Thanh toán đã được xác nhận trước đó',
        data: { payment, order }
      });
    }

    // ✅ Mark payment as completed
    await payment.markAsCompleted({
      transactionId: `${transactionId}-SIMULATED`,
      vnpayDetails: {
        vnp_TxnRef: transactionId,
        vnp_TransactionNo: `${Date.now()}`,
        vnp_ResponseCode: responseCode,
        vnp_PayDate: new Date().toISOString(),
        isSimulated: true
      }
    });

    // ✅ Đơn hàng vẫn giữ trạng thái PENDING để admin xác nhận
    // Không tự động chuyển sang CONFIRMED khi thanh toán thành công
    console.log('✅ Payment simulated successfully - Order remains PENDING for admin confirmation');

    console.log('✅ Payment simulated successfully:', payment._id);

    // Send notification asynchronously
    setImmediate(async () => {
      try {
        await Notification.createPaymentNotification(
          userId,
          order._id,
          'COMPLETED',
          `Thanh toán cho đơn hàng ${order.orderNumber} thành công (Test)`
        );
        console.log('✅ Notification sent for simulated payment');
      } catch (notifError) {
        console.error('❌ Notification failed (non-critical):', notifError.message);
      }
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Giả lập thanh toán thành công',
      data: {
        payment: await Payment.findById(payment._id),
        order: await Order.findById(order._id)
      }
    });

  } catch (error) {
    console.error('❌ Error simulating payment:', error);
    throw error;
  }
};

// ========== admin ROUTES ==========

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

  // ✅ Validate status transition - Updated logic (bỏ PROCESSING, REFUNDED)
  const validTransitions = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['SHIPPING', 'CANCELLED'], // ✅ Từ Đã xác nhận → Đang giao (bỏ PROCESSING)
    'SHIPPING': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [], // ✅ Hoàn thành là trạng thái cuối (bỏ REFUNDED)
    'CANCELLED': [],
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

  // Tạo thông báo thân thiện cho user
  const notificationMessages = {
    'CONFIRMED': `🎉 Đơn hàng ${order.orderNumber} đã được xác nhận! Chúng tôi đang chuẩn bị hàng cho bạn.`,
    'SHIPPING': `📦 Đơn hàng ${order.orderNumber} đang trên đường giao đến bạn!${trackingNumber ? ` Mã vận đơn: ${trackingNumber}` : ''}`,
    'COMPLETED': `✅ Đơn hàng ${order.orderNumber} đã được giao thành công! Đừng quên chia sẻ trải nghiệm của bạn bằng cách đánh giá sản phẩm nhé! 🌟`,
    'CANCELLED': `❌ Đơn hàng ${order.orderNumber} đã bị hủy.${note ? ` Lý do: ${note}` : ''}`
  };

  const notificationMessage = notificationMessages[status] || note || `Đơn hàng ${order.orderNumber} đã được cập nhật`;

  // Tạo thông báo cho user
  await Notification.createOrderNotification(
    order.userId,
    order._id,
    status,
    notificationMessage
  );

  // Lấy lại order với thông tin customer đầy đủ
  const updatedOrder = await Order.findById(id)
    .populate('userId', 'fullName email phone')
    .lean();

  // Đổi tên trường userId thành customer để phù hợp với frontend
  if (updatedOrder) {
    updatedOrder.customer = {
      _id: updatedOrder.userId._id,
      fullName: updatedOrder.userId.fullName,
      email: updatedOrder.userId.email,
      phone: updatedOrder.userId.phone
    };
    delete updatedOrder.userId;
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: updatedOrder || order
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
  processStripePayment,
  stripeWebhook,
  createVNPayPayment,
  vnpayReturn,
  simulateVNPayPayment,
  getAllOrders,
  updateOrderStatus,
  getOrderStatistics
};