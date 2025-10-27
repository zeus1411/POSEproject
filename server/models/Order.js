import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: String,
  sku: String,
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng phải lớn hơn 0']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPING',
        'COMPLETED',
        'CANCELLED',
        'REFUNDED',
        'FAILED'
      ],
      default: 'PENDING'
    },
    shippingAddress: {
      fullName: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      street: {
        type: String,
        required: true
      },
      ward: {
        type: String,
        required: true
      },
      district: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      country: {
        type: String,
        default: 'Việt Nam'
      },
      postalCode: String
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion'
    },
    promotionCode: String,
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: Date,
    trackingNumber: String,
    shippingProvider: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelReason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    refundAmount: Number,
    refundedAt: Date,
    notes: String,
    adminNotes: String,
    statusHistory: [
      {
        status: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ isPaid: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const orderNum = String(count + 1).padStart(5, '0');
    
    this.orderNumber = `ORD${year}${month}${day}${orderNum}`;
  }
  
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function (next) {
  // Calculate subtotal from items
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      item.subtotal = item.price * item.quantity * (1 - item.discount / 100);
      return sum + item.subtotal;
    }, 0);
  }
  
  // Calculate total price
  this.totalPrice = this.subtotal + this.shippingFee + this.tax - this.discount;
  
  next();
});

// Add status to history when status changes
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: this.cancelReason || ''
    });
    
    // Set timestamps for specific statuses
    if (this.status === 'COMPLETED' && !this.deliveredAt) {
      this.deliveredAt = new Date();
    }
    
    if (this.status === 'CANCELLED' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
  
  next();
});

// Note: Product stock updates should be handled in the controller/service layer
// to avoid circular dependency issues and have better control over transactions

// Method to update order status
orderSchema.methods.updateStatus = async function (newStatus, note = '', updatedBy = null) {
  this.status = newStatus;
  
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy
  });
  
  await this.save();
};

// Method to cancel order
orderSchema.methods.cancelOrder = async function (reason, cancelledBy) {
  if (['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(this.status)) {
    throw new Error('Không thể hủy đơn hàng này');
  }
  
  this.status = 'CANCELLED';
  this.cancelReason = reason;
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  
  await this.save();
};

// Method to confirm payment
orderSchema.methods.confirmPayment = async function (paidAt = new Date()) {
  this.isPaid = true;
  this.paidAt = paidAt;
  
  if (this.status === 'PENDING') {
    this.status = 'CONFIRMED';
  }
  
  await this.save();
};

// Static method to get user's order history
orderSchema.statics.getUserOrders = function (userId, options = {}) {
  const { status, limit = 10, page = 1 } = options;
  const query = { userId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .sort('-createdAt')
    .limit(limit)
    .skip((page - 1) * limit)
    .populate('items.productId', 'name images');
};

// Check if order can be reviewed
orderSchema.methods.canBeReviewed = function () {
  return this.status === 'COMPLETED' && this.deliveredAt;
};

// Order statistics
orderSchema.statics.getStatistics = async function (startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $nin: ['CANCELLED', 'FAILED'] }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        averageOrderValue: { $avg: '$totalPrice' }
      }
    }
  ]);
  
  return stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
};

// Static method to get

const Order = mongoose.model('Order', orderSchema);

export default Order;