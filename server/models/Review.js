import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Vui lòng chọn số sao đánh giá'],
      min: [1, 'Đánh giá tối thiểu 1 sao'],
      max: [5, 'Đánh giá tối đa 5 sao']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự']
    },
    comment: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung đánh giá'],
      trim: true,
      minlength: [10, 'Nội dung đánh giá phải có ít nhất 10 ký tự'],
      maxlength: [1000, 'Nội dung đánh giá không được vượt quá 1000 ký tự']
    },
    images: [
      {
        url: String,
        publicId: String,
        alt: String
      }
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0
    },
    unhelpful: {
      type: Number,
      default: 0,
      min: 0
    },
    helpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    unhelpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    adminResponse: {
      comment: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      respondedAt: Date
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes
reviewSchema.index({ productId: 1, userId: 1, orderId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, rating: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

// Validate that user actually purchased the product
reviewSchema.pre('save', async function (next) {
  if (this.isNew) {
    const Order = mongoose.model('Order');
    const order = await Order.findOne({
      _id: this.orderId,
      userId: this.userId,
      'items.productId': this.productId,
      status: 'COMPLETED'
    });
    
    if (!order) {
      const error = new Error('Bạn chỉ có thể đánh giá sản phẩm đã mua');
      return next(error);
    }
    
    this.isVerifiedPurchase = true;
  }
  
  next();
});

// Update product rating after review is saved/updated
reviewSchema.post('save', async function (doc) {
  if (doc.status === 'APPROVED') {
    const Product = mongoose.model('Product');
    const product = await Product.findById(doc.productId);
    
    if (product) {
      await product.updateRating();
    }
  }
});

// Update product rating after review is deleted
reviewSchema.post('remove', async function (doc) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(doc.productId);
  
  if (product) {
    await product.updateRating();
  }
});

// Method to mark review as helpful
reviewSchema.methods.markAsHelpful = async function (userId) {
  // Remove from unhelpful if exists
  const unhelpfulIndex = this.unhelpfulBy.indexOf(userId);
  if (unhelpfulIndex > -1) {
    this.unhelpfulBy.splice(unhelpfulIndex, 1);
    this.unhelpful = Math.max(0, this.unhelpful - 1);
  }
  
  // Add to helpful if not already there
  if (!this.helpfulBy.includes(userId)) {
    this.helpfulBy.push(userId);
    this.helpful += 1;
  }
  
  await this.save();
  return this;
};

// Method to mark review as unhelpful
reviewSchema.methods.markAsUnhelpful = async function (userId) {
  // Remove from helpful if exists
  const helpfulIndex = this.helpfulBy.indexOf(userId);
  if (helpfulIndex > -1) {
    this.helpfulBy.splice(helpfulIndex, 1);
    this.helpful = Math.max(0, this.helpful - 1);
  }
  
  // Add to unhelpful if not already there
  if (!this.unhelpfulBy.includes(userId)) {
    this.unhelpfulBy.push(userId);
    this.unhelpful += 1;
  }
  
  await this.save();
  return this;
};

// Method to remove helpful/unhelpful mark
reviewSchema.methods.removeHelpfulMark = async function (userId) {
  const helpfulIndex = this.helpfulBy.indexOf(userId);
  const unhelpfulIndex = this.unhelpfulBy.indexOf(userId);
  
  if (helpfulIndex > -1) {
    this.helpfulBy.splice(helpfulIndex, 1);
    this.helpful = Math.max(0, this.helpful - 1);
  }
  
  if (unhelpfulIndex > -1) {
    this.unhelpfulBy.splice(unhelpfulIndex, 1);
    this.unhelpful = Math.max(0, this.unhelpful - 1);
  }
  
  await this.save();
  return this;
};

// Method to add admin response
reviewSchema.methods.addAdminResponse = async function (comment, respondedBy) {
  this.adminResponse = {
    comment,
    respondedBy,
    respondedAt: new Date()
  };
  
  await this.save();
  return this;
};

// Method to approve review
reviewSchema.methods.approve = async function () {
  this.status = 'APPROVED';
  await this.save();
  
  return this;
};

// Method to reject review
reviewSchema.methods.reject = async function () {
  this.status = 'REJECTED';
  await this.save();
  
  return this;
};

// Static method to get product reviews
reviewSchema.statics.getProductReviews = function (productId, options = {}) {
  const { 
    rating, 
    sortBy = '-createdAt', 
    limit = 10, 
    page = 1,
    status = 'APPROVED'
  } = options;
  
  const query = { productId, status };
  
  if (rating) {
    query.rating = rating;
  }
  
  return this.find(query)
    .populate('userId', 'username avatar')
    .sort(sortBy)
    .limit(limit)
    .skip((page - 1) * limit);
};

// Static method to get review statistics for a product
reviewSchema.statics.getProductReviewStats = async function (productId) {
  const stats = await this.aggregate([
    { $match: { productId: mongoose.Types.ObjectId(productId), status: 'APPROVED' } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);
  
  const totalReviews = stats.reduce((sum, stat) => sum + stat.count, 0);
  const averageRating = stats.reduce((sum, stat) => sum + (stat._id * stat.count), 0) / totalReviews || 0;
  
  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };
  
  stats.forEach(stat => {
    ratingDistribution[stat._id] = stat.count;
  });
  
  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution
  };
};

// Static method to check if user can review product for specific order
reviewSchema.statics.canUserReview = async function (userId, productId, orderId) {
  const Order = mongoose.model('Order');
  
  // Check if user has purchased the product in this specific order
  const order = await Order.findOne({
    _id: orderId,
    userId,
    'items.productId': productId,
    status: 'COMPLETED'
  });
  
  if (!order) {
    return { canReview: false, reason: 'Đơn hàng chưa hoàn thành hoặc không chứa sản phẩm này' };
  }
  
  // Check if user has already reviewed this product in this order
  const existingReview = await this.findOne({ userId, productId, orderId });
  
  if (existingReview) {
    return { canReview: false, reason: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi', reviewId: existingReview._id };
  }
  
  return { canReview: true, orderId: order._id };
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;