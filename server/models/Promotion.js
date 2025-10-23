import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề khuyến mãi'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự']
    },
    code: {
      type: String,
      required: [true, 'Vui lòng nhập mã khuyến mãi'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]{4,20}$/, 'Mã khuyến mãi chỉ chứa chữ in hoa và số, từ 4-20 ký tự']
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, 'Giá trị giảm giá không được âm']
    },
    minimumOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Giá trị đơn hàng tối thiểu không được âm']
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, 'Giá trị giảm tối đa không được âm']
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    usageLimit: {
      type: Number,
      min: [0, 'Giới hạn sử dụng không được âm']
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    usageLimitPerUser: {
      type: Number,
      default: 1,
      min: 1
    },
    isActive: {
      type: Boolean,
      default: true
    },
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    excludedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    userType: {
      type: String,
      enum: ['all', 'new_users', 'existing_users', 'vip_users'],
      default: 'all'
    },
    specificUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isStackable: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Number,
      default: 0
    },
    image: {
      url: String,
      publicId: String
    },
    termsAndConditions: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
promotionSchema.index({ code: 1 });
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ endDate: 1 });

// Validate date range
promotionSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
  }
  next();
});

// Validate discount value for percentage
promotionSchema.pre('save', function (next) {
  if (this.discountType === 'PERCENTAGE' && this.discountValue > 100) {
    return next(new Error('Giảm giá theo phần trăm không được vượt quá 100%'));
  }
  next();
});

// Method to check if promotion is valid
promotionSchema.methods.isValid = function () {
  const now = new Date();
  
  if (!this.isActive) {
    return { valid: false, reason: 'Mã khuyến mãi không còn hiệu lực' };
  }
  
  if (now < this.startDate) {
    return { valid: false, reason: 'Mã khuyến mãi chưa bắt đầu' };
  }
  
  if (now > this.endDate) {
    return { valid: false, reason: 'Mã khuyến mãi đã hết hạn' };
  }
  
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'Mã khuyến mãi đã hết lượt sử dụng' };
  }
  
  return { valid: true };
};

// Method to check if user can use promotion
promotionSchema.methods.canUserUse = async function (userId) {
  const validity = this.isValid();
  if (!validity.valid) {
    return validity;
  }
  
  // Check user type restrictions
  if (this.userType === 'new_users') {
    const Order = mongoose.model('Order');
    const orderCount = await Order.countDocuments({ 
      userId, 
      status: { $in: ['COMPLETED', 'SHIPPING', 'PROCESSING'] }
    });
    
    if (orderCount > 0) {
      return { valid: false, reason: 'Mã khuyến mãi chỉ dành cho khách hàng mới' };
    }
  }
  
  // Check specific users
  if (this.specificUsers.length > 0) {
    const isSpecificUser = this.specificUsers.some(
      id => id.toString() === userId.toString()
    );
    
    if (!isSpecificUser) {
      return { valid: false, reason: 'Bạn không có quyền sử dụng mã khuyến mãi này' };
    }
  }
  
  // Check usage limit per user
  const Order = mongoose.model('Order');
  const userUsageCount = await Order.countDocuments({
    userId,
    promotionId: this._id,
    status: { $nin: ['CANCELLED', 'FAILED'] }
  });
  
  if (userUsageCount >= this.usageLimitPerUser) {
    return { 
      valid: false, 
      reason: `Bạn đã sử dụng mã khuyến mãi này ${this.usageLimitPerUser} lần` 
    };
  }
  
  return { valid: true };
};

// Method to calculate discount amount
promotionSchema.methods.calculateDiscount = function (orderAmount, items = []) {
  let discount = 0;
  
  // Check minimum order value
  if (orderAmount < this.minimumOrderValue) {
    return {
      discount: 0,
      applicable: false,
      reason: `Đơn hàng tối thiểu ${this.minimumOrderValue.toLocaleString('vi-VN')} VNĐ`
    };
  }
  
  // Check applicable products/categories
  let applicableAmount = orderAmount;
  
  if (this.applicableProducts.length > 0 || this.applicableCategories.length > 0) {
    applicableAmount = items.reduce((sum, item) => {
      const isApplicable = 
        this.applicableProducts.some(id => id.toString() === item.productId.toString()) ||
        this.applicableCategories.some(id => id.toString() === item.categoryId.toString());
      
      const isExcluded = this.excludedProducts.some(
        id => id.toString() === item.productId.toString()
      );
      
      if (isApplicable && !isExcluded) {
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);
    
    if (applicableAmount === 0) {
      return {
        discount: 0,
        applicable: false,
        reason: 'Không có sản phẩm nào áp dụng được mã khuyến mãi'
      };
    }
  }
  
  // Calculate discount based on type
  switch (this.discountType) {
    case 'PERCENTAGE':
      discount = (applicableAmount * this.discountValue) / 100;
      if (this.maxDiscountAmount) {
        discount = Math.min(discount, this.maxDiscountAmount);
      }
      break;
      
    case 'FIXED_AMOUNT':
      discount = Math.min(this.discountValue, applicableAmount);
      break;
      
    case 'FREE_SHIPPING':
      // Shipping discount will be handled separately
      discount = 0;
      break;
  }
  
  return {
    discount: Math.round(discount),
    applicable: true,
    discountType: this.discountType
  };
};

// Method to apply promotion
promotionSchema.methods.applyPromotion = async function () {
  this.usedCount += 1;
  await this.save();
  
  return this;
};

// Static method to get active promotions
promotionSchema.statics.getActivePromotions = function () {
  const now = new Date();
  
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { usageLimit: { $exists: false } },
      { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
    ]
  }).sort('-priority -createdAt');
};

// Static method to find promotion by code
promotionSchema.statics.findByCode = function (code) {
  return this.findOne({ 
    code: code.toUpperCase(),
    isActive: true
  });
};

// Static method to get user-eligible promotions
promotionSchema.statics.getUserEligiblePromotions = async function (userId) {
  const activePromotions = await this.getActivePromotions();
  const eligiblePromotions = [];
  
  for (const promotion of activePromotions) {
    const canUse = await promotion.canUserUse(userId);
    if (canUse.valid) {
      eligiblePromotions.push(promotion);
    }
  }
  
  return eligiblePromotions;
};

// Automatically deactivate expired promotions
promotionSchema.statics.deactivateExpired = async function () {
  const now = new Date();
  
  const result = await this.updateMany(
    {
      isActive: true,
      endDate: { $lt: now }
    },
    { isActive: false }
  );
  
  return result;
};

const Promotion = mongoose.model('Promotion', promotionSchema);

export default Promotion;