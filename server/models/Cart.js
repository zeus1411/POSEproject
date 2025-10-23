import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng phải lớn hơn 0'],
    default: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
      min: 0
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes
cartSchema.index({ userId: 1 });
cartSchema.index({ 'items.productId': 1 });

// Update cart totals before saving
cartSchema.pre('save', function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  next();
});

// Calculate subtotal with product prices
cartSchema.methods.calculateSubtotal = async function () {
  await this.populate('items.productId', 'price discount');
  
  this.subtotal = this.items.reduce((sum, item) => {
    if (item.productId) {
      const price = item.productId.price;
      const discount = item.productId.discount || 0;
      const itemTotal = price * item.quantity * (1 - discount / 100);
      return sum + itemTotal;
    }
    return sum;
  }, 0);
  
  await this.save();
  return this.subtotal;
};

// Add item to cart
cartSchema.methods.addItem = async function (productId, quantity = 1) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }
  
  if (!product.isInStock(quantity)) {
    throw new Error('Sản phẩm không đủ số lượng trong kho');
  }
  
  const existingItem = this.items.find(
    item => item.productId.toString() === productId.toString()
  );
  
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    
    if (!product.isInStock(newQuantity)) {
      throw new Error('Vượt quá số lượng tồn kho');
    }
    
    existingItem.quantity = newQuantity;
  } else {
    this.items.push({
      productId,
      quantity,
      addedAt: new Date()
    });
  }
  
  await this.save();
  await this.calculateSubtotal();
  
  return this;
};

// Update item quantity
cartSchema.methods.updateItemQuantity = async function (productId, quantity) {
  if (quantity < 1) {
    throw new Error('Số lượng phải lớn hơn 0');
  }
  
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }
  
  if (!product.isInStock(quantity)) {
    throw new Error('Sản phẩm không đủ số lượng trong kho');
  }
  
  const item = this.items.find(
    item => item.productId.toString() === productId.toString()
  );
  
  if (!item) {
    throw new Error('Sản phẩm không có trong giỏ hàng');
  }
  
  item.quantity = quantity;
  
  await this.save();
  await this.calculateSubtotal();
  
  return this;
};

// Remove item from cart
cartSchema.methods.removeItem = async function (productId) {
  this.items = this.items.filter(
    item => item.productId.toString() !== productId.toString()
  );
  
  await this.save();
  await this.calculateSubtotal();
  
  return this;
};

// Clear cart
cartSchema.methods.clearCart = async function () {
  this.items = [];
  this.totalItems = 0;
  this.subtotal = 0;
  
  await this.save();
  
  return this;
};

// Get cart with full product details
cartSchema.methods.getCartWithDetails = async function () {
  await this.populate({
    path: 'items.productId',
    select: 'name price discount images stock status'
  });
  
  // Filter out items with deleted/inactive products
  this.items = this.items.filter(item => {
    return item.productId && item.productId.status === 'ACTIVE';
  });
  
  await this.calculateSubtotal();
  
  return this;
};

// Validate cart items stock before checkout
cartSchema.methods.validateStock = async function () {
  await this.populate('items.productId', 'stock status name');
  
  const errors = [];
  
  for (const item of this.items) {
    if (!item.productId) {
      errors.push({
        productId: item.productId,
        message: 'Sản phẩm không tồn tại'
      });
      continue;
    }
    
    if (item.productId.status !== 'ACTIVE') {
      errors.push({
        productId: item.productId._id,
        productName: item.productId.name,
        message: 'Sản phẩm không còn kinh doanh'
      });
    }
    
    if (!item.productId.isInStock(item.quantity)) {
      errors.push({
        productId: item.productId._id,
        productName: item.productId.name,
        message: `Chỉ còn ${item.productId.stock} sản phẩm trong kho`,
        availableStock: item.productId.stock
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function (userId) {
  let cart = await this.findOne({ userId });
  
  if (!cart) {
    cart = await this.create({ userId, items: [] });
  }
  
  return cart;
};

// Static method to merge guest cart with user cart
cartSchema.statics.mergeGuestCart = async function (userId, guestCartItems) {
  let cart = await this.getOrCreateCart(userId);
  
  for (const guestItem of guestCartItems) {
    await cart.addItem(guestItem.productId, guestItem.quantity);
  }
  
  return cart;
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;