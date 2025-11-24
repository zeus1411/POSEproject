import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errorHandler.js';
import { buildVNPayUrl, verifyVNPayReturn } from './vnpayService.js';
import cacheService from './cacheService.js';

/**
 * Order Service
 * Contains all business logic for order operations
 * This is the most complex service handling transactions, payments, and stock management
 */

class OrderService {
  /**
   * Create new order from cart
   * @param {string} userId - User ID
   * @param {Object} orderData - { shippingAddress, paymentMethod, promotionCode, notes }
   * @param {Object} req - Request object (for IP address)
   * @returns {Promise<Object>} Created order with payment info
   */
  async createOrder(userId, orderData, req) {
    // NOTE: Transactions disabled for standalone MongoDB (Docker development)
    // const session = await mongoose.startSession();
    // session.startTransaction();

    try {
      const { 
        shippingAddress, 
        paymentMethod = 'COD',
        promotionCode,
        notes 
      } = orderData;

      // Validate shipping address
      if (!shippingAddress) {
        throw new BadRequestError('Thiếu thông tin địa chỉ giao hàng');
      }
      
      const requiredFields = ['fullName', 'phone', 'street', 'ward', 'district', 'city'];
      const missingFields = requiredFields.filter(field => !shippingAddress[field]);
      
      if (missingFields.length > 0) {
        throw new BadRequestError(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
      }

      // Get user cart
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      
      if (!cart || cart.items.length === 0) {
        throw new BadRequestError('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng');
      }

      // Validate stock and prepare order items
      const orderItems = [];
      let subtotal = 0;

      for (const item of cart.items) {
        const product = item.productId;
        
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

        // Update stock
        if (product.hasVariants && selectedVariant) {
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
      }

      // Calculate fees
      const shippingFee = subtotal >= 500000 ? 0 : 30000;
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

      const tax = 0;
      const totalPrice = subtotal + shippingFee + tax - discount;

      // Create order
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

      // Handle payment
      const payment = await Payment.create([{
        orderId: order[0]._id,
        userId,
        method: paymentMethod,
        status: 'PENDING_PAYMENT',
        amount: totalPrice,
        currency: 'VND',
        transactionId: paymentMethod === 'VNPAY' ? `VNPAY-${Date.now()}` : undefined
      }]); // session disabled for standalone MongoDB

      order[0].paymentId = payment[0]._id;
      await order[0].save(); // session disabled for standalone MongoDB

      // Clear cart
      await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } }
        // { session } // Disabled for standalone MongoDB
      );

      // Commit transaction
      // await session.commitTransaction(); // Disabled for standalone MongoDB

      // Send notification async
      setImmediate(async () => {
        try {
          console.log('📧 Starting to send notifications for order:', order[0].orderNumber);
          
          // ✅ Notification for customer
          await Notification.createOrderNotification(
            userId,
            order[0]._id,
            'PENDING',
            `Đơn hàng ${order[0].orderNumber} đã được tạo thành công`
          );
          console.log('✅ Customer notification created');
          
          // ✅ Notification for all admins
          const user = await User.findById(userId);
          console.log('👤 User found:', user?.username, 'Total price:', totalPrice);
          
          const adminNotifications = await Notification.createNewOrderNotificationForAdmins(
            order[0]._id,
            order[0].orderNumber,
            user?.fullName || user?.username || 'Khách hàng',
            totalPrice
          );
          console.log('✅ Admin notifications created:', adminNotifications.length);
        } catch (notifError) {
          console.error('❌ Notification failed (non-critical):', notifError);
          console.error('Error stack:', notifError.stack);
        }
      });

      // Generate VNPay URL if needed
      if (paymentMethod === 'VNPAY') {
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

        return {
          order: order[0],
          payment: payment[0],
          paymentUrl: vnpayUrl
        };
      }

      return {
        order: order[0],
        payment: payment[0]
      };

    } catch (error) {
      // await session.abortTransaction(); // Disabled for standalone MongoDB
      throw error;
    } finally {
      // session.endSession(); // Disabled for standalone MongoDB
    }
  }

  /**
   * Get order preview (before placing order)
   * @param {string} userId - User ID
   * @param {string} promotionCode - Optional promotion code
   * @returns {Promise<Object>} Order preview data
   */
  async getOrderPreview(userId, promotionCode) {
    // Implementation similar to previewOrder in controller
    const user = await User.findById(userId).select('username email phone defaultAddress');
    
    if (!user) {
      throw new NotFoundError('Không tìm thấy thông tin người dùng');
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name price salePrice discount images sku stock status'
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Giỏ hàng trống');
    }

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

    return {
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
    };
  }

  /**
   * Get user orders
   * @param {string} userId - User ID
   * @param {Object} filters - { status, page, limit }
   * @returns {Promise<Object>} Orders with pagination
   */
  async getUserOrders(userId, filters) {
    const { status, page = 1, limit = 10 } = filters;

    // Thử lấy từ cache
    const cachedOrders = await cacheService.getUserOrders(userId, filters);
    if (cachedOrders) {
      return cachedOrders;
    }

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

    const result = {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };

    // Lưu vào cache (TTL 2 phút)
    await cacheService.setUserOrders(userId, filters, result, 120);

    return result;
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<Object>} Order object
   */
  async getOrderById(orderId, userId, userRole) {
    // Thử lấy từ cache
    const cachedOrder = await cacheService.getOrder(orderId);
    if (cachedOrder) {
      // Vẫn phải kiểm tra quyền
      if (userRole !== 'admin' && cachedOrder.userId._id.toString() !== userId) {
        throw new UnauthorizedError('Bạn không có quyền xem đơn hàng này');
      }
      return cachedOrder;
    }

    const order = await Order.findById(orderId)
      .populate('items.productId', 'name images sku')
      .populate('paymentId')
      .populate('userId', 'username email phone');

    if (!order) {
      throw new NotFoundError('Không tìm thấy đơn hàng');
    }

    if (userRole !== 'admin' && order.userId._id.toString() !== userId) {
      throw new UnauthorizedError('Bạn không có quyền xem đơn hàng này');
    }

    // Lưu vào cache (TTL 3 phút)
    await cacheService.setOrder(orderId, order, 180);

    return order;
  }

  /**
   * Cancel order
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Updated order
   */
  async cancelOrder(orderId, userId, reason = 'Không có lý do') {
    // NOTE: Transactions disabled for standalone MongoDB (Docker development)
    // const session = await mongoose.startSession();
    // session.startTransaction();
    
    try {
      const order = await Order.findById(orderId)
        .select('status userId items paymentId')
        // .session(session) // Disabled for standalone MongoDB
        .lean();

      if (!order) {
        throw new NotFoundError('Không tìm thấy đơn hàng');
      }

      if (order.userId.toString() !== userId) {
        throw new UnauthorizedError('Bạn không có quyền hủy đơn hàng này');
      }

      const cancellableStatuses = ['PENDING', 'CONFIRMED', 'FAILED'];
      if (!cancellableStatuses.includes(order.status)) {
        throw new BadRequestError(
          `Không thể hủy đơn hàng ở trạng thái "${order.status}". Chỉ có thể hủy đơn hàng ở trạng thái: ${cancellableStatuses.join(', ')}`
        );
      }

      // Update order status
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
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

      // Restore product stocks
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

      // Update payment status if exists
      if (order.paymentId) {
        await Payment.updateOne(
          { _id: order.paymentId, status: { $ne: 'COMPLETED' } },
          { $set: { status: 'CANCELLED' } }
          // { session } // Disabled for standalone MongoDB
        );
      }

      // await session.commitTransaction(); // Disabled for standalone MongoDB

      // Xóa cache order
      await cacheService.invalidateOrder(orderId);

      const populatedOrder = await Order.findById(orderId)
        .populate('items.productId', 'name price images')
        .populate('userId', 'fullName email phoneNumber')
        .populate('paymentId', 'method status')
        .lean();

      return populatedOrder;

    } catch (error) {
      // await session.abortTransaction(); // Disabled for standalone MongoDB
      throw error;
    } finally {
      // session.endSession(); // Disabled for standalone MongoDB
    }
  }

  // Additional admin methods can be added here
  // getAllOrders, updateOrderStatus, getOrderStatistics, etc.
}

// Export singleton instance
export default new OrderService();
