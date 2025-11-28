import Promotion from '../models/Promotion.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { NotFoundError, BadRequestError } from '../utils/errorHandler.js';

class PromotionService {
  // ==================== ADMIN SERVICES ====================
  
  /**
   * Create new promotion
   */
  async createPromotion(data, adminId) {
    // Validate code uniqueness if provided
    if (data.code) {
      const existingPromotion = await Promotion.findOne({ code: data.code });
      if (existingPromotion) {
        throw new BadRequestError('Mã khuyến mãi đã tồn tại');
      }
    }

    // Validate targets based on applyTo
    if (data.applyTo === 'SPECIFIC_PRODUCTS' && (!data.targetProducts || data.targetProducts.length === 0)) {
      throw new BadRequestError('Phải chọn ít nhất 1 sản phẩm');
    }
    
    if (data.applyTo === 'CATEGORY' && (!data.targetCategories || data.targetCategories.length === 0)) {
      throw new BadRequestError('Phải chọn ít nhất 1 danh mục');
    }

    // Create promotion
    const promotion = await Promotion.create({
      ...data,
      createdBy: adminId
    });

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
   * Update promotion
   */
  async updatePromotion(promotionId, data, adminId) {
    const promotion = await Promotion.findById(promotionId);
    
    if (!promotion) {
      throw new NotFoundError('Không tìm thấy chương trình khuyến mãi');
    }

    // Check code uniqueness if changed
    if (data.code && data.code !== promotion.code) {
      const existingPromotion = await Promotion.findOne({ 
        code: data.code,
        _id: { $ne: promotionId }
      });
      if (existingPromotion) {
        throw new BadRequestError('Mã khuyến mãi đã tồn tại');
      }
    }

    // Update fields
    Object.assign(promotion, data);
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
   * Calculate discount for cart
   */
  async calculateDiscount(cart, promotions = [], userId = null) {
    let totalDiscount = 0;
    const appliedPromotions = [];

    // Sort by priority
    const sortedPromotions = promotions.sort((a, b) => b.priority - a.priority);

    for (const promotion of sortedPromotions) {
      // Skip if already applied max discount
      if (promotion.conditions.maxDiscount && totalDiscount >= promotion.conditions.maxDiscount) {
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
        
        case 'BUY_X_GET_Y':
          discount = this.calculateBuyXGetYDiscount(cart, promotion);
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
          discountAmount: discount
        });
      }
    }

    return {
      totalDiscount,
      appliedPromotions
    };
  }

  // ==================== HELPER METHODS ====================

  calculateCartTotal(cart) {
    return cart.items.reduce((sum, item) => {
      const price = item.selectedVariant?.price || item.productId.salePrice || item.productId.price;
      return sum + (price * item.quantity);
    }, 0);
  }

  calculatePercentageDiscount(cart, promotion) {
    let discount = 0;

    if (promotion.applyTo === 'ORDER') {
      const cartTotal = this.calculateCartTotal(cart);
      discount = (cartTotal * promotion.discountValue) / 100;
    } else {
      // Apply to specific products/categories
      cart.items.forEach(item => {
        if (this.isItemEligible(item, promotion)) {
          const price = item.selectedVariant?.price || item.productId.salePrice || item.productId.price;
          discount += (price * item.quantity * promotion.discountValue) / 100;
        }
      });
    }

    return discount;
  }

  calculateFixedDiscount(cart, promotion) {
    if (promotion.applyTo === 'ORDER') {
      return promotion.discountValue;
    }

    // For products, apply fixed discount per item
    let discount = 0;
    cart.items.forEach(item => {
      if (this.isItemEligible(item, promotion)) {
        discount += promotion.discountValue * item.quantity;
      }
    });

    return discount;
  }

  calculateFreeShippingDiscount(cart, promotion) {
    const cartTotal = this.calculateCartTotal(cart);
    
    if (cartTotal >= promotion.conditions.minOrderValue) {
      return cart.shippingFee || 0;
    }

    return 0;
  }

  calculateBuyXGetYDiscount(cart, promotion) {
    let discount = 0;

    cart.items.forEach(item => {
      if (this.isItemEligible(item, promotion)) {
        const buyQty = promotion.conditions.buyQuantity;
        const getQty = promotion.conditions.getQuantity;
        
        const sets = Math.floor(item.quantity / buyQty);
        const freeItems = sets * getQty;
        
        if (freeItems > 0) {
          const price = item.selectedVariant?.price || item.productId.salePrice || item.productId.price;
          discount += price * freeItems;
        }
      }
    });

    return discount;
  }

  isItemEligible(item, promotion) {
    if (promotion.applyTo === 'ALL_PRODUCTS') {
      return true;
    }

    if (promotion.applyTo === 'SPECIFIC_PRODUCTS') {
      return promotion.targetProducts.some(
        pid => pid.toString() === item.productId._id.toString()
      );
    }

    if (promotion.applyTo === 'CATEGORY') {
      return promotion.targetCategories.some(
        cid => cid.toString() === item.productId.category.toString()
      );
    }

    return false;
  }
}

export default new PromotionService();
