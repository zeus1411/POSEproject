import mongoose from 'mongoose';
import slugify from '../../utils/slugify.js';

const blogCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên danh mục bài viết'],
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
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
blogCategorySchema.index({ slug: 1 });

// Generate slug before saving
blogCategorySchema.pre('save', async function (next) {
  if (this.isModified('name') || !this.slug) {
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

const BlogCategory = mongoose.model('BlogCategory', blogCategorySchema);

export default BlogCategory;

