import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    method: {
      type: String,
      enum: ['COD', 'STRIPE', 'VNPAY', 'BANK_TRANSFER'],
      required: true
    },
    status: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'PROCESSING',
        'COMPLETED',
        'FAILED',
        'CANCELLED'
      ],
      default: 'PENDING_PAYMENT'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'VND',
      uppercase: true
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },
    
    // VNPay specific fields
    vnpaySubMethod: {
      type: String,
      enum: ['QR_CODE', 'ATM_CARD', 'CREDIT_CARD', 'WALLET', null]
    },
    vnpayDetails: {
      vnp_TxnRef: String,
      vnp_BankCode: String,
      vnp_CardType: String,
      vnp_TransactionNo: String,
      vnp_PayDate: String,
      vnp_ResponseCode: String,
      vnp_TransactionStatus: String
    },
    
    // Stripe specific fields
    stripeDetails: {
      paymentIntentId: String,
      chargeId: String,
      last4: String,
      brand: String,
      errorCode: String,
      errorMessage: String
    },
    
    // Bank transfer specific fields
    bankTransferDetails: {
      bankName: String,
      accountNumber: String,
      accountHolder: String,
      transferDate: Date,
      referenceNumber: String,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: Date,
      proofImages: [String]
    },
    
    failureReason: String,
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date,
    processedAt: Date,
    
    metadata: {
      type: Map,
      of: String
    },
    
    ipAddress: String,
    userAgent: String
  },
  {
    timestamps: true
  }
);

// Indexes
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ createdAt: -1 });

// Generate unique transaction ID
paymentSchema.pre('save', async function (next) {
  if (!this.transactionId && this.method !== 'COD') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.transactionId = `TXN${timestamp}${random}`;
  }
  
  next();
});

// Update order payment status when payment status changes
paymentSchema.post('save', async function (doc) {
  const Order = mongoose.model('Order');
  const order = await Order.findById(doc.orderId);
  
  if (order) {
    if (doc.status === 'COMPLETED') {
      await order.confirmPayment(doc.processedAt || new Date());
    } else if (doc.status === 'FAILED' || doc.status === 'CANCELLED') {
      if (order.status === 'PENDING') {
        order.status = 'FAILED';
        await order.save();
      }
    }
  }
});

// Method to mark payment as completed
paymentSchema.methods.markAsCompleted = async function (transactionDetails = {}) {
  this.status = 'COMPLETED';
  this.processedAt = new Date();
  
  // Update specific payment method details
  if (this.method === 'VNPAY' && transactionDetails.vnpayDetails) {
    this.vnpayDetails = {
      ...this.vnpayDetails,
      ...transactionDetails.vnpayDetails
    };
  } else if (this.method === 'STRIPE' && transactionDetails.stripeDetails) {
    this.stripeDetails = {
      ...this.stripeDetails,
      ...transactionDetails.stripeDetails
    };
  }
  
  if (transactionDetails.transactionId) {
    this.transactionId = transactionDetails.transactionId;
  }
  
  await this.save();
  
  return this;
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = async function (reason) {
  this.status = 'FAILED';
  this.failureReason = reason;
  this.processedAt = new Date();
  
  await this.save();
  
  return this;
};

// Method to verify bank transfer
paymentSchema.methods.verifyBankTransfer = async function (verificationData, verifiedBy) {
  if (this.method !== 'BANK_TRANSFER') {
    throw new Error('Phương thức thanh toán không phải là chuyển khoản ngân hàng');
  }
  
  this.bankTransferDetails = {
    ...this.bankTransferDetails,
    ...verificationData,
    verifiedBy,
    verifiedAt: new Date()
  };
  
  this.status = 'COMPLETED';
  this.processedAt = new Date();
  
  await this.save();
  
  return this;
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function (startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'COMPLETED'
      }
    },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
  
  return stats;
};

// Static method to get failed payments for retry
paymentSchema.statics.getFailedPayments = function (userId, limit = 10) {
  return this.find({
    userId,
    status: 'FAILED',
    method: { $ne: 'COD' }
  })
    .sort('-createdAt')
    .limit(limit)
    .populate('orderId', 'orderNumber totalPrice items');
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;