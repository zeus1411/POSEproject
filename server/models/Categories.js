const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên danh mục'],
    unique: true,
    trim: true,
    maxlength: [100, 'Tên danh mục không được quá 100 ký tự']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Mô tả không được quá 500 ký tự']
  },
  image: {
    type: String
  },
  icon: {
    type: String // Icon class or URL
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // SEO
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  // Stats
  productCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

// Virtual for products
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId'
});

// Virtual for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Pre-save middleware: Generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      locale: 'vi'
    });
  }
  next();
});

// Pre-save middleware: Set level based on parent
categorySchema.pre('save', async function(next) {
  if (this.isModified('parentId')) {
    if (this.parentId) {
      const parent = await this.constructor.findById(this.parentId);
      if (parent) {
        this.level = parent.level + 1;
      }
    } else {
      this.level = 0;
    }
  }
  next();
});

// Instance method: Update product count
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 
    categoryId: this._id, 
    isActive: true 
  });
  this.productCount = count;
  await this.save();
};

// Instance method: Get all ancestors
categorySchema.methods.getAncestors = async function() {
  const ancestors = [];
  let currentCategory = this;
  
  while (currentCategory.parentId) {
    const parent = await this.constructor.findById(currentCategory.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    currentCategory = parent;
  }
  
  return ancestors;
};

// Instance method: Get all descendants
categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  
  const findChildren = async (categoryId) => {
    const children = await this.constructor.find({ parentId: categoryId });
    for (const child of children) {
      descendants.push(child);
      await findChildren(child._id);
    }
  };
  
  await findChildren(this._id);
  return descendants;
};

// Static method: Get category tree
categorySchema.statics.getCategoryTree = async function(parentId = null) {
  const categories = await this.find({ 
    parentId, 
    isActive: true 
  })
  .sort({ order: 1, name: 1 })
  .lean();
  
  for (const category of categories) {
    category.children = await this.getCategoryTree(category._id);
  }
  
  return categories;
};

// Static method: Get featured categories
categorySchema.statics.getFeaturedCategories = function() {
  return this.find({ 
    isFeatured: true, 
    isActive: true 
  })
  .sort({ order: 1 })
  .lean();
};

module.exports = mongoose.model('Category', categorySchema);