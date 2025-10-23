import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên danh mục'],
      unique: true,
      trim: true,
      maxlength: [100, 'Tên danh mục không được vượt quá 100 ký tự']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
    },
    image: {
      url: String,
      publicId: String,
      alt: String
    },
    icon: String,
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    level: {
      type: Number,
      default: 0,
      min: 0
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    productCount: {
      type: Number,
      default: 0,
      min: 0
    },
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate products
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId'
});

// Virtual populate subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

// Generate slug before saving
categorySchema.pre('save', async function (next) {
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
  
  next();
});

// Set level based on parent
categorySchema.pre('save', async function (next) {
  if (this.isModified('parentId') && this.parentId) {
    const parent = await this.constructor.findById(this.parentId);
    if (parent) {
      this.level = parent.level + 1;
    }
  } else if (!this.parentId) {
    this.level = 0;
  }
  
  next();
});

// Update product count
categorySchema.methods.updateProductCount = async function () {
  const Product = mongoose.model('Product');
  
  const count = await Product.countDocuments({
    categoryId: this._id,
    status: 'ACTIVE'
  });
  
  this.productCount = count;
  await this.save();
};

// Get category hierarchy (breadcrumb)
categorySchema.methods.getHierarchy = async function () {
  const hierarchy = [this];
  let current = this;
  
  while (current.parentId) {
    current = await this.constructor.findById(current.parentId);
    if (current) {
      hierarchy.unshift(current);
    } else {
      break;
    }
  }
  
  return hierarchy;
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function () {
  const categories = await this.find({ isActive: true }).sort('order');
  
  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => {
        if (parentId === null) {
          return !cat.parentId;
        }
        return cat.parentId && cat.parentId.toString() === parentId.toString();
      })
      .map(cat => ({
        ...cat.toObject(),
        children: buildTree(cat._id)
      }));
  };
  
  return buildTree();
};

// Static method to get root categories
categorySchema.statics.getRootCategories = function () {
  return this.find({ parentId: null, isActive: true }).sort('order');
};

const Category = mongoose.model('Category', categorySchema);

export default Category;