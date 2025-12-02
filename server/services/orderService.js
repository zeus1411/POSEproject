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
import { storeTempOrder } from '../utils/tempOrderStorage.js';
import { calculateShippingFee } from '../utils/shippingCalculator.js';

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
    try {
      const { 
        shippingAddress, 
        paymentMethod = 'COD',
        promotionCode,
        promotionCodes,
        notes 
      } = orderData;

      // ✅ Log promotion codes for debugging
      console.log('🏷️  Promotion codes received:', {
        promotionCode,
        promotionCodes,
        isArray: Array.isArray(promotionCodes),
        length: promotionCodes?.length
      });

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
      }

      // Calculate shipping fee theo bậc thang (14%, 8%, 5%, 3%, 1.8%)
      const shippingFee = calculateShippingFee(subtotal);
      let discount = 0;
      let promotionId = null;
      let promotionIds = [];
      const appliedCodes = [];
      
      // Handle multiple promotion codes (priority)
      const appliedPromotions = []; // Track applied promotions for usage recording
      
      console.log('🔍 Processing promotion codes...', promotionCodes);
      
      if (promotionCodes && Array.isArray(promotionCodes) && promotionCodes.length > 0) {
        const Promotion = mongoose.model('Promotion');
        
        for (const code of promotionCodes) {
          const promotion = await Promotion.findOne({ 
            code: code.trim().toUpperCase(),
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
          });

          if (promotion) {
            // ✅ Check usage limits before applying
            if (promotion.usageLimit.total !== null && promotion.usageCount >= promotion.usageLimit.total) {
              console.log(`❌ Promotion ${code} has reached total usage limit`);
              continue; // Skip this promotion
            }

            // Check per-user limit
            if (promotion.usageLimit.perUser !== null) {
              const userUsage = promotion.usedBy.find(u => u.userId.toString() === userId.toString());
              if (userUsage && userUsage.usedCount >= promotion.usageLimit.perUser) {
                console.log(`❌ User has reached usage limit for promotion ${code}`);
                continue; // Skip this promotion
              }
            }

            const minOrderValue = promotion.conditions?.minOrderValue || 0;
            const maxDiscount = promotion.conditions?.maxDiscount || null;
            
            if (subtotal >= minOrderValue) {
              let promoDiscount = 0;
              
              if (promotion.discountType === 'PERCENTAGE') {
                promoDiscount = Math.min(
                  (subtotal * promotion.discountValue) / 100,
                  maxDiscount || Infinity
                );
              } else if (promotion.discountType === 'FIXED_AMOUNT') {
                promoDiscount = promotion.discountValue;
              } else if (promotion.discountType === 'FREE_SHIPPING') {
                // Apply maxDiscount for FREE_SHIPPING
                promoDiscount = Math.min(shippingFee, maxDiscount || Infinity);
              }
              
              discount += promoDiscount;
              promotionIds.push(promotion._id);
              appliedCodes.push(code.trim().toUpperCase());
              appliedPromotions.push(promotion); // Store for usage recording
            }
          }
        }
        promotionId = promotionIds.length > 0 ? promotionIds[0] : null; // For backward compatibility
      } else if (promotionCode) {
        // Single promotion code (backward compatibility)
        const Promotion = mongoose.model('Promotion');
        const promotion = await Promotion.findOne({ 
          code: promotionCode,
          isActive: true,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        });

        if (promotion) {
          // ✅ Check usage limits before applying
          if (promotion.usageLimit.total !== null && promotion.usageCount >= promotion.usageLimit.total) {
            throw new BadRequestError(`Mã giảm giá ${promotionCode} đã hết lượt sử dụng`);
          }

          // Check per-user limit
          if (promotion.usageLimit.perUser !== null) {
            const userUsage = promotion.usedBy.find(u => u.userId.toString() === userId.toString());
            if (userUsage && userUsage.usedCount >= promotion.usageLimit.perUser) {
              throw new BadRequestError(`Bạn đã sử dụng hết số lần cho mã ${promotionCode}`);
            }
          }

          const minOrderValue = promotion.conditions?.minOrderValue || 0;
          const maxDiscount = promotion.conditions?.maxDiscount || null;
          
          if (subtotal >= minOrderValue) {
            if (promotion.discountType === 'PERCENTAGE') {
              discount = Math.min(
                (subtotal * promotion.discountValue) / 100,
                maxDiscount || Infinity
              );
            } else if (promotion.discountType === 'FIXED_AMOUNT') {
              discount = promotion.discountValue;
            } else if (promotion.discountType === 'FREE_SHIPPING') {
              // For FREE_SHIPPING, apply maxDiscount if set
              discount = Math.min(shippingFee, maxDiscount || Infinity);
            }
            promotionId = promotion._id;
            appliedCodes.push(promotionCode);
            appliedPromotions.push(promotion); // Store for usage recording
          } else {
            throw new BadRequestError(`Đơn hàng phải đạt tối thiểu ${minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã ${promotionCode}`);
          }
        }
      }

      const tax = 0;
      const totalPrice = subtotal + shippingFee + tax - discount;

      // ✅ Log order totals for debugging
      console.log('📊 Order Totals:', {
        subtotal,
        shippingFee,
        discount,
        tax,
        totalPrice,
        appliedPromotions: appliedCodes
      });

      // ==================== VNPay Flow: Store temp order data ====================
      if (paymentMethod === 'VNPAY') {
        console.log('🔵 VNPay Flow: Storing temporary order data (no database creation yet)...');
        
        const transactionId = `VNPAY-${Date.now()}`;
        
        // Store order data temporarily
        const tempOrder = storeTempOrder(transactionId, {
          userId,
          items: orderItems,
          subtotal,
          shippingFee,
          discount,
          tax,
          totalPrice,
          shippingAddress,
          promotionId,
          promotionCode: appliedCodes.length > 0 ? appliedCodes.join(',') : undefined,
          notes,
          paymentMethod: 'VNPAY'
        });
        
        // Generate VNPay URL
        const vnpayUrl = await buildVNPayUrl({
          order: {
            totalPrice: totalPrice,
            orderNumber: `TEMP-${transactionId}` // Temporary order number
          },
          payment: {
            transactionId: transactionId
          },
          ipAddr: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
        });

        console.log('🔵 Temporary order stored for VNPay payment');
        console.log('===================\n');

        return {
          order: { _id: transactionId, orderNumber: `TEMP-${transactionId}`, totalPrice },
          payment: { transactionId },
          paymentUrl: vnpayUrl
        };
      }

      // ==================== COD Flow: Direct order creation ====================
      console.log('💵 COD Flow: Creating order directly...');

      // Deduct stock for COD orders
      for (const item of cart.items) {
        const product = item.productId;
        
        if (!product) continue;

        // Handle variant products
        let selectedVariant = null;
        if (product.hasVariants && item.variantId) {
          selectedVariant = product.variants.find(v => v._id.toString() === item.variantId);
        }

        if (selectedVariant) {
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
          );
        }
        
        // ✅ Invalidate product cache after stock update
        await cacheService.invalidateProduct(product._id);
      }
      
      // Create order
      console.log('💾 Creating COD order with discount:', discount);
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
        promotionCode: appliedCodes.length > 0 ? appliedCodes.join(',') : undefined,
        notes,
        isPaid: false
      }]);
      console.log('✅ COD Order created with values:', {
        orderId: order[0]._id,
        subtotal: order[0].subtotal,
        discount: order[0].discount,
        totalPrice: order[0].totalPrice
      });

      // Handle payment for COD
      const payment = await Payment.create([{
        orderId: order[0]._id,
        userId,
        method: 'COD',
        status: 'PROCESSING',
        amount: totalPrice,
        currency: 'VND'
      }]);

      order[0].paymentId = payment[0]._id;
      await order[0].save();

      // ✅ Record promotion usage for COD orders
      if (appliedPromotions.length > 0) {
        console.log('📊 Recording promotion usage for COD order...');
        for (const promotion of appliedPromotions) {
          try {
            await promotion.recordUsage(userId);
            console.log(`✅ Recorded usage for promotion: ${promotion.code}`);
          } catch (error) {
            console.error(`❌ Failed to record usage for promotion ${promotion.code}:`, error);
          }
        }
      }

      // Clear cart for COD orders
      await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } }
      );

      // Send notification async for COD orders
      setImmediate(async () => {
        try {
          console.log('📧 Starting to send notifications for COD order:', order[0].orderNumber);
          
          await Notification.createOrderNotification(
            userId,
            order[0]._id,
            'PENDING',
            `Đơn hàng ${order[0].orderNumber} đã được tạo thành công`
          );
          
          const user = await User.findById(userId);
          await Notification.createNewOrderNotificationForAdmins(
            order[0]._id,
            order[0].orderNumber,
            user?.fullName || user?.username || 'Khách hàng',
            totalPrice
          );
          console.log('✅ COD order notifications sent');
        } catch (notifError) {
          console.error('❌ Notification failed:', notifError);
        }
      });

      return {
        order: order[0],
        payment: payment[0]
      };

    } catch (error) {
      throw error;
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
      select: 'name price salePrice discount images sku stock status hasVariants variants'
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

      // ✅ Get correct price: selectedVariant.price > product.salePrice > product.price
      let itemPrice = product.salePrice || product.price;
      
      // Check if item has selectedVariant with price
      if (item.selectedVariant && item.selectedVariant.price) {
        itemPrice = item.selectedVariant.price;
      } else if (product.hasVariants && item.variantId) {
        // Find variant by variantId if not already in selectedVariant
        const variant = product.variants?.find(v => v._id.toString() === item.variantId.toString());
        if (variant && variant.price) {
          itemPrice = variant.price;
        }
      }
      
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

    const shippingFee = calculateShippingFee(subtotal); // Bậc thang: 14%, 8%, 5%, 3%, 1.8%
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
        const minOrderValue = promotion.conditions?.minOrderValue || 0;
        const maxDiscount = promotion.conditions?.maxDiscount || null;
        
        if (subtotal >= minOrderValue) {
          if (promotion.discountType === 'PERCENTAGE') {
            discount = Math.min(
              (subtotal * promotion.discountValue) / 100,
              maxDiscount || Infinity
            );
          } else if (promotion.discountType === 'FIXED_AMOUNT') {
            discount = promotion.discountValue;
          } else if (promotion.discountType === 'FREE_SHIPPING') {
            // For FREE_SHIPPING, apply maxDiscount if set
            discount = Math.min(shippingFee, maxDiscount || Infinity);
          }
          
          promotionDetails = {
            code: promotion.code,
            description: promotion.description,
            discountValue: promotion.discountValue,
            discountType: promotion.discountType,
            discountAmount: discount
          };
        } else {
          promotionDetails = {
            error: `Đơn hàng tối thiểu ${minOrderValue.toLocaleString('vi-VN')}₫ để áp dụng mã`
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
