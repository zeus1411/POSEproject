import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: String,
    required: false // Optional - chỉ có khi product có variants
  },
  selectedVariant: {
    optionValues: {
      type: Map,
      of: String
    },
    price: Number,
    stock: Number
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
  await this.populate('items.productId', 'price discount hasVariants variants');
  
  this.subtotal = this.items.reduce((sum, item) => {
    if (item.productId) {
      let price = item.productId.price;
      
      // If product has variants and item has selected variant, use variant price
      if (item.selectedVariant && item.selectedVariant.price) {
        price = item.selectedVariant.price;
      } else if (item.productId.hasVariants && item.variantId) {
        // Find variant by variantId
        const variant = item.productId.variants.find(v => v._id.toString() === item.variantId);
        if (variant) {
          price = variant.price;
        }
      }
      
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
cartSchema.methods.addItem = async function (productId, quantity = 1, variantId = null) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }
  
  // Handle variant products
  let selectedVariant = null;
  let availableStock = product.stock;
  
  if (product.hasVariants) {
    if (!variantId) {
      throw new Error('Vui lòng chọn biến thể sản phẩm');
    }
    
    selectedVariant = product.variants.find(v => v._id.toString() === variantId);
    if (!selectedVariant) {
      throw new Error('Biến thể sản phẩm không tồn tại');
    }
    
    if (!selectedVariant.isActive) {
      throw new Error('Biến thể sản phẩm không khả dụng');
    }
    
    availableStock = selectedVariant.stock;
  }
  
  if (availableStock < quantity) {
    throw new Error('Sản phẩm không đủ số lượng trong kho');
  }
  
  // Check if item with same product and variant already exists
  const existingItem = this.items.find(item => {
    const sameProduct = item.productId.toString() === productId.toString();
    const sameVariant = product.hasVariants 
      ? item.variantId === variantId 
      : true;
    return sameProduct && sameVariant;
  });
  
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    
    if (newQuantity > availableStock) {
      throw new Error('Vượt quá số lượng tồn kho');
    }
    
    existingItem.quantity = newQuantity;
  } else {
    const newItem = {
      productId,
      quantity,
      addedAt: new Date()
    };
    
    if (product.hasVariants && selectedVariant) {
      newItem.variantId = variantId;
      newItem.selectedVariant = {
        optionValues: selectedVariant.optionValues,
        price: selectedVariant.price,
        stock: selectedVariant.stock
      };
    }
    
    this.items.push(newItem);
  }
  
  await this.save();
  await this.calculateSubtotal();
  
  return this;
};

// Update item quantity
cartSchema.methods.updateItemQuantity = async function (productId, quantity, variantId = null) {
  if (quantity < 1) {
    throw new Error('Số lượng phải lớn hơn 0');
  }
  
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }
  
  // Find the item (considering variant)
  const item = this.items.find(i => {
    const sameProduct = i.productId.toString() === productId.toString();
    const sameVariant = product.hasVariants 
      ? i.variantId === variantId 
      : true;
    return sameProduct && sameVariant;
  });
  
  if (!item) {
    throw new Error('Sản phẩm không có trong giỏ hàng');
  }
  
  // Check stock availability
  let availableStock = product.stock;
  if (product.hasVariants && variantId) {
    const variant = product.variants.find(v => v._id.toString() === variantId);
    if (!variant) {
      throw new Error('Biến thể sản phẩm không tồn tại');
    }
    availableStock = variant.stock;
  }
  
  if (quantity > availableStock) {
    throw new Error('Sản phẩm không đủ số lượng trong kho');
  }
  
  item.quantity = quantity;
  
  await this.save();
  await this.calculateSubtotal();
  
  return this;
};

// Remove item from cart
cartSchema.methods.removeItem = async function (productId, variantId = null) {
  this.items = this.items.filter(item => {
    const sameProduct = item.productId.toString() === productId.toString();
    if (!sameProduct) return true; // Keep items with different productId
    
    // If variantId specified, only remove matching variant
    if (variantId) {
      return item.variantId !== variantId;
    }
    
    // Otherwise remove all items with this productId
    return false;
  });
  
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
    select: 'name price discount images stock status hasVariants variants options'
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
  await this.populate('items.productId', 'stock status name hasVariants variants');
  
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
    
    // Check stock based on variant or product
    let availableStock = item.productId.stock;
    if (item.productId.hasVariants && item.variantId) {
      const variant = item.productId.variants.find(v => v._id.toString() === item.variantId);
      if (!variant) {
        errors.push({
          productId: item.productId._id,
          productName: item.productId.name,
          message: 'Biến thể sản phẩm không tồn tại'
        });
        continue;
      }
      
      if (!variant.isActive) {
        errors.push({
          productId: item.productId._id,
          productName: item.productId.name,
          message: 'Biến thể sản phẩm không khả dụng'
        });
        continue;
      }
      
      availableStock = variant.stock;
    }
    
    if (item.quantity > availableStock) {
      errors.push({
        productId: item.productId._id,
        productName: item.productId.name,
        message: `Chỉ còn ${availableStock} sản phẩm trong kho`,
        availableStock: availableStock
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
    await cart.addItem(guestItem.productId, guestItem.quantity, guestItem.variantId);
  }
  
  return cart;
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;