const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên sản phẩm'],
    trim: true,
    maxlength: [200, 'Tên sản phẩm không được quá 200 ký tự']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sản phẩm'],
    maxlength: [2000, 'Mô tả không được quá 2000 ký tự']
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá sản phẩm'],
    min: [0, 'Giá sản phẩm không được âm']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Giá so sánh không được âm']
  },
  cost: {
    type: Number,
    min: [0, 'Giá vốn không được âm']
  },
  image: {
    type: String,
    required: [true, 'Vui lòng upload ảnh sản phẩm']
  },
  images: [{
    type: String
  }],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Vui lòng chọn danh mục sản phẩm']
  },
  stock: {
    type: Number,
    required: [true, 'Vui lòng nhập số lượng tồn kho'],
    min: [0, 'Số lượng tồn kho không được âm'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Ngưỡng cảnh báo không được âm']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true
  },
  barcode: {
    type: String,
    sparse: true
  },
  // Product attributes
  attributes: {
    size: String,
    color: String,
    origin: String, // Xuất xứ
    careLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    },
    lightRequirement: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    co2Required: {
      type: Boolean,
      default: false
    },
    waterParams: {
      phMin: Number,
      phMax: Number,
      tempMin: Number,
      tempMax: Number,
      hardness: String
    }
  },
  // Tags for search & filter
  tags: [{
    type: String,
    trim: true
  }],
  // SEO
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  // Ratings
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating không được âm'],
    max: [5, 'Rating không được quá 5']
  },
  numReviews: {
    type: Number,
    default: 0,
    min: [0, 'Số lượng review không được âm']
  },
  // Sales stats
  soldCount: {
    type: Number,
    default: 0,
    min: [0, 'Số lượng bán không được âm']
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'Số lượt xem không được âm']
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  // Seller info (for marketplace feature)
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Timestamps
  publishedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 }, { sparse: true });

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId'
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.cost && this.cost > 0) {
    return Math.round(((this.price - this.cost) / this.cost) * 100);
  }
  return 0;
});

// Pre-save middleware: Generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { 
      lower: true, 
      strict: true,
      locale: 'vi'
    });
  }
  next();
});

// Pre-save middleware: Auto-generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku && this.isNew) {
    // Generate SKU: CAT-TIMESTAMP
    const categoryCode = this.categoryId ? this.categoryId.toString().slice(-4).toUpperCase() : 'PROD';
    const timestamp = Date.now().toString().slice(-6);
    this.sku = `${categoryCode}-${timestamp}`;
  }
  next();
});

// Pre-save middleware: Set publishedAt
productSchema.pre('save', function(next) {
  if (this.isModified('isActive') && this.isActive && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Instance method: Update rating
productSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    {
      $match: { productId: this._id }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].avgRating * 10) / 10;
    this.numReviews = stats[0].numReviews;
  } else {
    this.averageRating = 0;
    this.numReviews = 0;
  }
  
  await this.save();
};

// Instance method: Increment view count
productSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save();
};

// Instance method: Check if in stock
productSchema.methods.isInStock = function(quantity = 1) {
  return this.stock >= quantity && this.isActive;
};

// Instance method: Reserve stock
productSchema.methods.reserveStock = async function(quantity) {
  if (!this.isInStock(quantity)) {
    throw new Error('Sản phẩm không đủ số lượng trong kho');
  }
  
  this.stock -= quantity;
  await this.save();
};

// Instance method: Release stock
productSchema.methods.releaseStock = async function(quantity) {
  this.stock += quantity;
  await this.save();
};

// Static method: Find low stock products
productSchema.statics.findLowStock = function() {
  return this.find({
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    isActive: true
  });
};

// Static method: Find best sellers
productSchema.statics.findBestSellers = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ soldCount: -1 })
    .limit(limit)
    .populate('categoryId', 'name slug');
};

// Static method: Find new arrivals
productSchema.statics.findNewArrivals = function(limit = 10) {
  return this.find({ isActive: true, isNewArrival: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('categoryId', 'name slug');
};

// Static method: Search products
productSchema.statics.searchProducts = function(searchTerm, options = {}) {
  const {
    categoryId,
    minPrice,
    maxPrice,
    minRating,
    sort = '-createdAt',
    limit = 20,
    page = 1
  } = options;
  
  const query = {
    isActive: true,
    $text: { $search: searchTerm }
  };
  
  if (categoryId) query.categoryId = categoryId;
  if (minPrice) query.price = { ...query.price, $gte: minPrice };
  if (maxPrice) query.price = { ...query.price, $lte: maxPrice };
  if (minRating) query.averageRating = { $gte: minRating };
  
  return this.find(query)
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit)
    .populate('categoryId', 'name slug')
    .select('-__v');
};

module.exports = mongoose.model('Product', productSchema);