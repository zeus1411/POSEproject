import Promotion from '../models/Promotion.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { NotFoundError, BadRequestError } from '../utils/errorHandler.js';

class PromotionService {
  // ==================== ADMIN SERVICES ====================
  
  /**
   * Create new coupon
   */
  async createPromotion(data, adminId) {
    // Validate required fields for COUPON
    if (!data.code) {
      throw new BadRequestError('Mã giảm giá là bắt buộc');
    }

    // Validate code uniqueness
    const existingPromotion = await Promotion.findOne({ code: data.code });
    if (existingPromotion) {
      throw new BadRequestError('Mã khuyến mãi đã tồn tại');
    }

    // Force COUPON settings
    const couponData = {
      ...data,
      promotionType: 'COUPON',
      applyTo: 'ORDER',
      targetProducts: [], // Empty for coupons
      targetCategories: [], // Empty for coupons
      createdBy: adminId
    };

    // Create promotion
    const promotion = await Promotion.create(couponData);

    return promotion;
  }

  /**
   * Get all promotions (admin)
   */
  async getAllPromotions(filters = {}, page = 1, limit = 20) {
    const query = {};
    
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    
    if (filters.promotionType) {
      query.promotionType = filters.promotionType;
    }
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { code: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [promotions, total] = await Promise.all([
      Promotion.find(query)
        .populate('targetProducts', 'name price images')
        .populate('targetCategories', 'name')
        .populate('createdBy', 'username email')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Promotion.countDocuments(query)
    ]);

    return {
      promotions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get promotion by ID
   */
  async getPromotionById(promotionId) {
    const promotion = await Promotion.findById(promotionId)
      .populate('targetProducts', 'name price images')
      .populate('targetCategories', 'name')
      .populate('createdBy', 'username email');

    if (!promotion) {
      throw new NotFoundError('Không tìm thấy chương trình khuyến mãi');
    }

    return promotion;
  }

  /**
   * Update coupon
   */
  async updatePromotion(promotionId, data, adminId) {
    const promotion = await Promotion.findById(promotionId);
    
    if (!promotion) {
      throw new NotFoundError('Không tìm thấy mã giảm giá');
    }

    // Check code uniqueness if changed
    if (data.code && data.code !== promotion.code) {
      const existingPromotion = await Promotion.findOne({ 
        code: data.code,
        _id: { $ne: promotionId }
      });
      if (existingPromotion) {
        throw new BadRequestError('Mã giảm giá đã tồn tại');
      }
    }

    // Force COUPON settings
    const couponData = {
      ...data,
      promotionType: 'COUPON',
      applyTo: 'ORDER',
      targetProducts: [], // Empty for coupons
      targetCategories: [], // Empty for coupons
    };

    // Update fields
    Object.assign(promotion, couponData);
    promotion.updatedBy = adminId;
    
    await promotion.save();

    return promotion;
  }

  /**
   * Delete promotion
   */
  async deletePromotion(promotionId) {
    const promotion = await Promotion.findById(promotionId);
    
    if (!promotion) {
      throw new NotFoundError('Không tìm thấy chương trình khuyến mãi');
    }

    // Check if promotion has been used
    if (promotion.usageCount > 0) {
      throw new BadRequestError('Không thể xóa chương trình đã được sử dụng');
    }

    await promotion.deleteOne();

    return { message: 'Xóa chương trình khuyến mãi thành công' };
  }

  /**
   * Toggle promotion status
   */
  async togglePromotionStatus(promotionId) {
    const promotion = await Promotion.findById(promotionId);
    
    if (!promotion) {
      throw new NotFoundError('Không tìm thấy chương trình khuyến mãi');
    }

    promotion.isActive = !promotion.isActive;
    await promotion.save();

    return promotion;
  }

  // ==================== USER SERVICES ====================

  /**
   * Get available promotions for user
   */
  async getAvailablePromotions(userId) {
    const promotions = await Promotion.getActivePromotions();

    // Filter promotions that user can use
    const availablePromotions = promotions.filter(promo => promo.canUserUse(userId));

    return availablePromotions;
  }

  /**
   * Get all active coupons grouped by type (for dropdown)
   */
  async getAllActiveCoupons() {
    const coupons = await Promotion.find({
      promotionType: 'COUPON',
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).select('_id name code description discountType discountValue conditions')
      .sort({ priority: -1, createdAt: -1 });

    // Group coupons by discount type
    const freeShipping = [];
    const discount = [];

    for (const coupon of coupons) {
      if (coupon.discountType === 'FREE_SHIPPING') {
        freeShipping.push(coupon);
      } else {
        discount.push(coupon);
      }
    }

    return {
      freeShipping,
      discount
    };
  }

  /**
   * Get promotions for specific product
   */
  async getPromotionsForProduct(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    const promotions = await Promotion.getPromotionsByProduct(productId, product.category);

    return promotions;
  }

  /**
   * Get all applicable promotions for a cart
   * Since we only have COUPONs now, this will return empty array as coupons require manual input
   */
  async getApplicablePromotions(cart, userId = null) {
    // COUPONs are not automatically applicable - they require manual input via validateCoupon
    // Return empty array since all promotions are now COUPON type
    return [];
  }

  /**
   * Validate coupon code
   */
  async validateCoupon(code, userId, cart) {
    const promotion = await Promotion.findOne({ code: code.toUpperCase() });

    if (!promotion) {
      throw new NotFoundError('Mã giảm giá không tồn tại');
    }

    if (!promotion.isValid()) {
      throw new BadRequestError('Mã giảm giá đã hết hạn hoặc không còn khả dụng');
    }

    if (!promotion.canUserUse(userId)) {
      throw new BadRequestError('Bạn đã sử dụng hết số lần cho mã giảm giá này');
    }

    // Check first order condition
    if (promotion.conditions.firstOrderOnly) {
      const hasOrdered = await Order.exists({ userId, status: { $ne: 'CANCELLED' } });
      if (hasOrdered) {
        throw new BadRequestError('Mã giảm giá chỉ áp dụng cho đơn hàng đầu tiên');
      }
    }

    // Check min order value
    if (promotion.conditions.minOrderValue > 0) {
      const cartTotal = this.calculateCartTotal(cart);
      if (cartTotal < promotion.conditions.minOrderValue) {
        throw new BadRequestError(
          `Đơn hàng phải đạt tối thiểu ${promotion.conditions.minOrderValue.toLocaleString('vi-VN')}đ`
        );
      }
    }

    // Check min quantity
    if (promotion.conditions.minQuantity > 0) {
      const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQuantity < promotion.conditions.minQuantity) {
        throw new BadRequestError(
          `Phải mua tối thiểu ${promotion.conditions.minQuantity} sản phẩm`
        );
      }
    }

    return promotion;
  }

  /**
   * Check if user can use a specific coupon (for UI eligibility checks)
   */
  async checkCouponEligibility(code, userId, cartTotal = 0) {
    try {
      const promotion = await Promotion.findOne({ code: code.toUpperCase() });

      if (!promotion) {
        return { eligible: false, reason: 'Mã giảm giá không tồn tại' };
      }

      if (!promotion.isValid()) {
        return { eligible: false, reason: 'Mã giảm giá đã hết hạn hoặc không còn khả dụng' };
      }

      // Check usage limit - total
      if (promotion.usageLimit.total !== null && promotion.usageCount >= promotion.usageLimit.total) {
        return { eligible: false, reason: 'Mã giảm giá đã hết lượt sử dụng' };
      }

      // Check usage limit - per user
      if (promotion.usageLimit.perUser !== null && userId) {
        const userUsage = promotion.usedBy.find(u => u.userId.toString() === userId.toString());
        if (userUsage && userUsage.usedCount >= promotion.usageLimit.perUser) {
          return { eligible: false, reason: 'Bạn đã sử dụng hết số lần cho mã này' };
        }
      }

      // Check first order condition
      if (promotion.conditions.firstOrderOnly && userId) {
        const hasOrdered = await Order.exists({ userId, status: { $ne: 'CANCELLED' } });
        if (hasOrdered) {
          return { eligible: false, reason: 'Mã chỉ áp dụng cho đơn hàng đầu tiên' };
        }
      }

      // Check min order value
      if (promotion.conditions.minOrderValue > 0 && cartTotal > 0) {
        if (cartTotal < promotion.conditions.minOrderValue) {
          return { 
            eligible: false, 
            reason: `Đơn hàng phải đạt tối thiểu ${promotion.conditions.minOrderValue.toLocaleString('vi-VN')}đ`,
            minOrderValue: promotion.conditions.minOrderValue
          };
        }
      }

      return { eligible: true, promotion };
    } catch (error) {
      console.error('Error checking coupon eligibility:', error);
      return { eligible: false, reason: 'Lỗi kiểm tra mã giảm giá' };
    }
  }

  /**
   * Calculate discount for cart
   */
  async calculateDiscount(cart, promotions = [], userId = null) {
    let totalDiscount = 0;
    const appliedPromotions = [];

    // Calculate cart total first
    const cartTotal = this.calculateCartTotal(cart);

    // Sort by priority
    const sortedPromotions = promotions.sort((a, b) => b.priority - a.priority);

    for (const promotion of sortedPromotions) {
      // Check minimum order value condition
      const minOrderValue = promotion.conditions?.minOrderValue || 0;
      if (cartTotal < minOrderValue) {
        continue;
      }

      // Skip if already applied max discount
      if (promotion.conditions?.maxDiscount && totalDiscount >= promotion.conditions.maxDiscount) {
        continue;
      }

      let discount = 0;

      switch (promotion.discountType) {
        case 'PERCENTAGE':
          discount = this.calculatePercentageDiscount(cart, promotion);
          break;
        
        case 'FIXED_AMOUNT':
          discount = this.calculateFixedDiscount(cart, promotion);
          break;
        
        case 'FREE_SHIPPING':
          discount = this.calculateFreeShippingDiscount(cart, promotion);
          break;
        

      }

      // Apply max discount limit
      if (promotion.conditions.maxDiscount) {
        discount = Math.min(discount, promotion.conditions.maxDiscount);
      }

      if (discount > 0) {
        totalDiscount += discount;
        appliedPromotions.push({
          promotionId: promotion._id,
          name: promotion.name,
          code: promotion.code,
          promotionType: promotion.promotionType,
          discountType: promotion.discountType,
          discountAmount: discount
        });
      }
    }

    // Create breakdown by promotion type
    const breakdown = {
      productDiscounts: appliedPromotions.filter(p => p.promotionType === 'PRODUCT_DISCOUNT'),
      orderDiscounts: appliedPromotions.filter(p => p.promotionType === 'ORDER_DISCOUNT'),
      conditionalDiscounts: appliedPromotions.filter(p => p.promotionType === 'CONDITIONAL_DISCOUNT'),
      couponDiscounts: appliedPromotions.filter(p => p.promotionType === 'COUPON')
    };

    return {
      totalDiscount,
      appliedPromotions,
      breakdown
    };
  }

  // ==================== HELPER METHODS ====================

  calculateCartTotal(cart) {
    // If cart has subtotal already calculated, use it
    if (cart.subtotal) {
      return cart.subtotal;
    }
    
    // Otherwise calculate from items
    if (!cart.items || cart.items.length === 0) {
      return 0;
    }
    
    const total = cart.items.reduce((sum, item) => {
      // Priority: explicit price in item > selectedVariant.price > variant price > product price
      let price = item.price;
      
      if (!price && item.selectedVariant?.price) {
        price = item.selectedVariant.price;
      }
      
      if (!price && item.productId) {
        if (typeof item.productId === 'object') {
          price = item.productId.salePrice || item.productId.price;
        }
      }
      
      const itemTotal = price * item.quantity;
      return sum + itemTotal;
    }, 0);
    
    return total;
  }

  calculatePercentageDiscount(cart, promotion) {
    // For COUPON, always apply to ORDER total
    const cartTotal = this.calculateCartTotal(cart);
    return (cartTotal * promotion.discountValue) / 100;
  }

  calculateFixedDiscount(cart, promotion) {
    // For COUPON, always apply fixed amount to ORDER
    return promotion.discountValue;
  }

  calculateFreeShippingDiscount(cart, promotion) {
    // For COUPON free shipping, check min order value if set
    const cartTotal = this.calculateCartTotal(cart);
    const minOrderValue = promotion.conditions?.minOrderValue || 0;
    
    if (cartTotal >= minOrderValue) {
      // Return a standard shipping fee amount or the actual shipping fee from cart
      return cart.shippingFee || 30000; // Default 30k VND shipping fee
    }

    return 0;
  }



  isItemEligible(item, promotion) {
    // For COUPON type, all items are eligible since it applies to ORDER
    return true;
  }
}

export default new PromotionService();
