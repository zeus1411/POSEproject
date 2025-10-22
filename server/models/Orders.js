const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: String,
  price: {
    type: Number,
    required: true,
    min: [0, 'Giá không được âm']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng phải lớn hơn 0']
  },
  subtotal: {
    type: Number,
    required: true
  }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  ward: String,
  district: String,
  city: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc']
  },
  items: [orderItemSchema],
  shippingAddress: {
    type: shippingAddressSchema,
    required: [true, 'Địa chỉ giao hàng là bắt buộc']
  },
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Tổng tiền hàng không được âm']
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: [0, 'Phí vận chuyển không được âm']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Giảm giá không được âm']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Thuế không được âm']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Tổng tiền không được âm']
  },
  // Payment
  paymentMethod: {
    type: String,
    enum: ['cod', 'vnpay', 'stripe', 'momo'],
    default: 'cod',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    paymentDate: Date,
    paymentInfo: mongoose.Schema.Types.Mixed
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Delivery
  trackingNumber: String,
  carrier: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  // Promotion
  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion'
  },
  couponCode: String,
  // Notes
  customerNote: String,
  adminNote: String,
  // Cancellation
  cancelReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  // Refund
  refundAmount: Number,
  refundReason: String,
  refundedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for item count
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save middleware: Generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Count orders today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: startOfDay }
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    this.orderNumber = `ORD${year}${month}${day}${sequence}`;
  }
  next();
});

// Pre-save middleware: Calculate totals
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('shippingFee') || this.isModified('discount') || this.isModified('tax')) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((total, item) => {
      item.subtotal = item.price * item.quantity;
      return total + item.subtotal;
    }, 0);
    
    // Calculate total
    this.totalPrice = this.subtotal + this.shippingFee + this.tax - this.discount;
    
    // Ensure total is not negative
    if (this.totalPrice < 0) this.totalPrice = 0;
  }
  next();
});

// Pre-save middleware: Add status history
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Instance method: Can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Instance method: Can be refunded
orderSchema.methods.canBeRefunded = function() {
  return ['delivered'].includes(this.status) && this.paymentStatus === 'paid';
};

// Instance method: Cancel order
orderSchema.methods.cancelOrder = async function(reason, userId) {
  if (!this.canBeCancelled()) {
    throw new Error('Đơn hàng không thể hủy ở trạng thái hiện tại');
  }
  
  this.status = 'cancelled';
  this.cancelReason = reason;
  this.cancelledBy = userId;
  this.cancelledAt = new Date();
  
  // Restore product stock
  const Product = mongoose.model('Product');
  for (const item of this.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity }
    });
  }
  
  await this.save();
};

// Instance method: Update status
orderSchema.methods.updateStatus = async function(newStatus, note, userId) {
  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: []
  };
  
  if (!allowedTransitions[this.status].includes(newStatus)) {
    throw new Error(`Không thể chuyển từ trạng thái ${this.status} sang ${newStatus}`);
  }
  
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    note,
    updatedBy: userId,
    timestamp: new Date()
  });
  
  // Update delivered date
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
    
    // Update product sold count
    const Product = mongoose.model('Product');
    for (const item of this.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { soldCount: item.quantity }
      });
    }
  }
  
  await this.save();
};

// Instance method: Process payment
orderSchema.methods.processPayment = async function(paymentInfo) {
  this.paymentStatus = 'paid';
  this.paymentDetails = {
    transactionId: paymentInfo.transactionId,
    paymentDate: new Date(),
    paymentInfo
  };
  await this.save();
};

// Static method: Get user orders
orderSchema.statics.getUserOrders = function(userId, options = {}) {
  const { status, limit = 10, page = 1 } = options;
  
  const query = { userId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .populate('items.productId', 'name image slug')
    .lean();
};

// Static method: Get order statistics
orderSchema.statics.getOrderStats = async function(startDate, endDate) {
  const match = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        averageOrderValue: { $avg: '$totalPrice' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  };
};

// Static method: Get revenue by date
orderSchema.statics.getRevenueByDate = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'delivered',
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);