import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên sản phẩm'],
      trim: true,
      maxlength: [200, 'Tên sản phẩm không được vượt quá 200 ký tự']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả sản phẩm'],
      maxlength: [2000, 'Mô tả không được vượt quá 2000 ký tự']
    },
    price: {
      type: Number,
      required: [true, 'Vui lòng nhập giá sản phẩm'],
      min: [0, 'Giá sản phẩm phải lớn hơn 0']
    },
    originalPrice: {
      type: Number,
      min: [0, 'Giá gốc phải lớn hơn 0']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Giảm giá không được âm'],
      max: [100, 'Giảm giá không được vượt quá 100%']
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(images) {
          // Validate that each item is a string and is a valid URL
          return Array.isArray(images) && 
                 images.every(img => typeof img === 'string' && img.trim().length > 0);
        },
        message: 'Mỗi phần tử trong mảng ảnh phải là một URL hợp lệ'
      }
    },
    stock: {
      type: Number,
      required: [true, 'Vui lòng nhập số lượng tồn kho'],
      min: [0, 'Số lượng tồn kho không được âm'],
      default: 0
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Vui lòng chọn danh mục sản phẩm']
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'],
      default: 'ACTIVE'
    },
    sku: {
      type: String,
      required: [true, 'Vui lòng nhập SKU'],
      unique: true,
      uppercase: true
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    specifications: {
      type: Map,
      of: String,
      default: {}
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isNew: {
      type: Boolean,
      default: false
    },
    weight: {
      type: Number,
      min: 0 // gram
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId'
});

// Indexes for search and filter
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });

// Generate slug before saving
productSchema.pre('save', async function (next) {
  if (this.isModified('name') && !this.slug) {
    const slugify = (str) => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    };
    
    let slug = slugify(this.name);
    let slugExists = await this.constructor.findOne({ slug });
    let counter = 1;
    
    while (slugExists) {
      slug = `${slugify(this.name)}-${counter}`;
      slugExists = await this.constructor.findOne({ slug });
      counter++;
    }
    
    this.slug = slug;
  }
  
  // Calculate discount if originalPrice exists
  if (this.originalPrice && this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  
  next();
});

// Update status based on stock
productSchema.pre('save', function (next) {
  if (this.isModified('stock')) {
    if (this.stock === 0 && this.status === 'ACTIVE') {
      this.status = 'OUT_OF_STOCK';
    } else if (this.stock > 0 && this.status === 'OUT_OF_STOCK') {
      this.status = 'ACTIVE';
    }
  }
  next();
});

// Method to update rating
productSchema.methods.updateRating = async function () {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { productId: this._id } },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
    this.rating.count = stats[0].totalReviews;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }
  
  await this.save();
};

// Method to check if product is in stock
productSchema.methods.isInStock = function (quantity = 1) {
  return this.stock >= quantity && this.status === 'ACTIVE';
};

// Method to decrease stock
productSchema.methods.decreaseStock = async function (quantity) {
  if (!this.isInStock(quantity)) {
    throw new Error('Sản phẩm không đủ số lượng trong kho');
  }
  
  this.stock -= quantity;
  this.soldCount += quantity;
  
  await this.save();
};

// Method to increase stock (for order cancellation)
productSchema.methods.increaseStock = async function (quantity) {
  this.stock += quantity;
  this.soldCount = Math.max(0, this.soldCount - quantity);
  
  await this.save();
};

// Static method to get featured products
productSchema.statics.getFeaturedProducts = function (limit = 8) {
  return this.find({ isFeatured: true, status: 'ACTIVE' })
    .populate('categoryId', 'name slug')
    .sort('-rating.average -soldCount')
    .limit(limit);
};

// Static method to get new products
productSchema.statics.getNewProducts = function (limit = 8) {
  return this.find({ isNew: true, status: 'ACTIVE' })
    .populate('categoryId', 'name slug')
    .sort('-createdAt')
    .limit(limit);
};

// Static method to get best sellers
productSchema.statics.getBestSellers = function (limit = 8) {
  return this.find({ status: 'ACTIVE' })
    .populate('categoryId', 'name slug')
    .sort('-soldCount')
    .limit(limit);
};

const Product = mongoose.model('Product', productSchema);

export default Product;