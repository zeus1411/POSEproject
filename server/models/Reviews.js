const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID là bắt buộc']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc']
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, 'Vui lòng chọn đánh giá'],
    min: [1, 'Rating tối thiểu là 1'],
    max: [5, 'Rating tối đa là 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Tiêu đề không được quá 100 ký tự']
  },
  comment: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung đánh giá'],
    trim: true,
    maxlength: [1000, 'Nội dung không được quá 1000 ký tự']
  },
  images: [{
    type: String
  }],
  // Helpful votes
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulVotes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isHelpful: Boolean,
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Admin response
  adminResponse: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  // Status
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: String
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true }); // One review per user per product

// Pre-save middleware: Check verified purchase
reviewSchema.pre('save', async function(next) {
  if (this.isNew && this.orderId) {
    const Order = mongoose.model('Order');
    const order = await Order.findOne({
      _id: this.orderId,
      userId: this.userId,
      status: 'delivered'
    });
    
    if (order) {
      const hasProduct = order.items.some(
        item => item.productId.toString() === this.productId.toString()
      );
      
      if (hasProduct) {
        this.isVerifiedPurchase = true;
      }
    }
  }
  next();
});

// Post-save middleware: Update product rating
reviewSchema.post('save', async function() {
  if (this.isApproved) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.productId);
    
    if (product) {
      await product.updateRating();
    }
  }
});

// Post-remove middleware: Update product rating
reviewSchema.post('remove', async function() {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.productId);
  
  if (product) {
    await product.updateRating();
  }
});

// Instance method: Vote helpful
reviewSchema.methods.voteHelpful = async function(userId, isHelpful) {
  // Remove existing vote from this user
  this.helpfulVotes = this.helpfulVotes.filter(
    vote => vote.userId.toString() !== userId.toString()
  );
  
  // Add new vote
  this.helpfulVotes.push({
    userId,
    isHelpful,
    votedAt: new Date()
  });
  
  // Update helpful count
  this.helpfulCount = this.helpfulVotes.filter(vote => vote.isHelpful).length;
  
  await this.save();
  return this;
};

// Instance method: Add admin response
reviewSchema.methods.addAdminResponse = async function(comment, adminId) {
  this.adminResponse = {
    comment,
    respondedBy: adminId,
    respondedAt: new Date()
  };
  
  await this.save();
  return this;
};

// Instance method: Approve review
reviewSchema.methods.approve = async function() {
  this.isApproved = true;
  await this.save();
  
  // Update product rating
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.productId);
  if (product) {
    await product.updateRating();
  }
  
  return this;
};

// Instance method: Report review
reviewSchema.methods.report = async function(reason) {
  this.isReported = true;
  this.reportReason = reason;
  await this.save();
  return this;
};

// Static method: Get product reviews
reviewSchema.statics.getProductReviews = function(productId, options = {}) {
  const {
    rating,
    sort = '-createdAt',
    limit = 10,
    page = 1,
    onlyVerified = false
  } = options;
  
  const query = {
    productId,
    isApproved: true
  };
  
  if (rating) query.rating = rating;
  if (onlyVerified) query.isVerifiedPurchase = true;
  
  return this.find(query)
    .populate('userId', 'username avatar')
    .populate('adminResponse.respondedBy', 'username')
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit)
    .lean();
};

// Static method: Get rating distribution
reviewSchema.statics.getRatingDistribution = async function(productId) {
  const distribution = await this.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        isApproved: true
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
  
  // Convert to object with all ratings
  const result = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distribution.forEach(item => {
    result[item._id] = item.count;
  });
  
  return result;
};

// Static method: Get user reviews
reviewSchema.statics.getUserReviews = function(userId, options = {}) {
  const { limit = 10, page = 1 } = options;
  
  return this.find({ userId })
    .populate('productId', 'name image slug')
    .sort('-createdAt')
    .limit(limit)
    .skip((page - 1) * limit)
    .lean();
};

// Static method: Check if user can review
reviewSchema.statics.canUserReview = async function(userId, productId) {
  // Check if user already reviewed
  const existingReview = await this.findOne({ userId, productId });
  if (existingReview) {
    return {
      canReview: false,
      reason: 'Bạn đã đánh giá sản phẩm này rồi'
    };
  }
  
  // Check if user purchased the product
  const Order = mongoose.model('Order');
  const order = await Order.findOne({
    userId,
    status: 'delivered',
    'items.productId': productId
  });
  
  if (!order) {
    return {
      canReview: false,
      reason: 'Bạn cần mua sản phẩm này để đánh giá'
    };
  }
  
  return {
    canReview: true,
    orderId: order._id
  };
};

module.exports = mongoose.model('Review', reviewSchema);