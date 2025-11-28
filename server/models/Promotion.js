import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Tên chương trình khuyến mãi là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tên không được vượt quá 200 ký tự']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự']
  },
  code: {
    type: String,
    uppercase: true,
    trim: true,
    sparse: true, // Allow null but must be unique if exists
    index: true
  },

  // Promotion Type
  promotionType: {
    type: String,
    enum: ['PRODUCT_DISCOUNT', 'ORDER_DISCOUNT', 'CONDITIONAL_DISCOUNT', 'COUPON'],
    required: true
  },

  // Discount Type & Value
  discountType: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: [0, 'Giá trị giảm giá phải lớn hơn 0']
  },

  // Apply To
  applyTo: {
    type: String,
    enum: ['ALL_PRODUCTS', 'SPECIFIC_PRODUCTS', 'CATEGORY', 'ORDER'],
    required: true
  },
  targetProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  targetCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],

  // Conditions
  conditions: {
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Giá trị đơn hàng tối thiểu phải >= 0']
    },
    minQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng tối thiểu phải >= 0']
    },
    maxDiscount: {
      type: Number,
      default: null, // null = unlimited
      min: [0, 'Giảm giá tối đa phải >= 0']
    },
    firstOrderOnly: {
      type: Boolean,
      default: false
    },
    // For BUY_X_GET_Y
    buyQuantity: {
      type: Number,
      min: [1, 'Số lượng mua phải >= 1']
    },
    getQuantity: {
      type: Number,
      min: [1, 'Số lượng tặng phải >= 1']
    }
  },

  // Usage Limits
  usageLimit: {
    total: {
      type: Number,
      default: null, // null = unlimited
      min: [0, 'Giới hạn sử dụng phải >= 0']
    },
    perUser: {
      type: Number,
      default: null, // null = unlimited
      min: [0, 'Giới hạn mỗi user phải >= 0']
    }
  },

  // Usage Tracking
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  usedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedCount: {
      type: Number,
      default: 0
    },
    lastUsedAt: Date
  }],

  // Time Range
  startDate: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc']
  },
  endDate: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc']
  },

  // Status & Priority
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0
  },

  // Display Settings
  displaySettings: {
    showInBanner: {
      type: Boolean,
      default: false
    },
    bannerImage: String,
    badgeText: String, // e.g., "HOT", "NEW", "-30%"
    badgeColor: {
      type: String,
      default: '#FF6B6B'
    }
  },

  // Admin Info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
promotionSchema.index({ code: 1 });
promotionSchema.index({ promotionType: 1, isActive: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ 'targetProducts': 1 });
promotionSchema.index({ 'targetCategories': 1 });

// Validation: Check dates
promotionSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
  }
  next();
});

// Method: Check if promotion is valid
promotionSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.usageLimit.total === null || this.usageCount < this.usageLimit.total)
  );
};

// Method: Check if user can use this promotion
promotionSchema.methods.canUserUse = function(userId) {
  if (!this.isValid()) return false;
  
  if (this.usageLimit.perUser === null) return true;
  
  const userUsage = this.usedBy.find(u => u.userId.toString() === userId.toString());
  if (!userUsage) return true;
  
  return userUsage.usedCount < this.usageLimit.perUser;
};

// Method: Record usage
promotionSchema.methods.recordUsage = async function(userId) {
  this.usageCount += 1;
  
  const userIndex = this.usedBy.findIndex(u => u.userId.toString() === userId.toString());
  
  if (userIndex >= 0) {
    this.usedBy[userIndex].usedCount += 1;
    this.usedBy[userIndex].lastUsedAt = new Date();
  } else {
    this.usedBy.push({
      userId,
      usedCount: 1,
      lastUsedAt: new Date()
    });
  }
  
  await this.save();
};

// Static: Get active promotions
promotionSchema.statics.getActivePromotions = async function(filters = {}) {
  const now = new Date();
  const query = {
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    ...filters
  };
  
  return this.find(query)
    .populate('targetProducts', 'name price images')
    .populate('targetCategories', 'name')
    .sort({ priority: -1, createdAt: -1 });
};

// Static: Get promotions by product
promotionSchema.statics.getPromotionsByProduct = async function(productId, categoryId) {
  const now = new Date();
  
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { applyTo: 'ALL_PRODUCTS' },
      { targetProducts: productId },
      { targetCategories: categoryId }
    ]
  }).sort({ priority: -1 });
};

const Promotion = mongoose.model('Promotion', promotionSchema);

export default Promotion;
