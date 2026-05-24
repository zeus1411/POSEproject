import mongoose from 'mongoose';
import slugify from '../../utils/slugify.js';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề bài viết'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, 'Mô tả ngắn không được vượt quá 500 ký tự']
    },
    content: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung bài viết']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    coverImage: {
      url: {
        type: String,
        required: [true, 'Vui lòng tải lên ảnh bìa cho bài viết']
      },
      publicId: {
        type: String,
        required: true
      }
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogCategory',
      required: [true, 'Vui lòng chọn danh mục bài viết']
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
      }
    ],
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'PUBLISHED'],
      default: 'DRAFT'
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0
    },
    bookmarkCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isHidden: {
      type: Boolean,
      default: false
    },
    publishedAt: Date,
    readTime: {
      type: Number, // in minutes
      default: 0
    },
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    metaTitle: String,
    metaDescription: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
blogSchema.index({ title: 'text', content: 'text' });
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, isHidden: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

// Generate slug before saving
blogSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let slug = slugify(this.title);
    let slugExists = await this.constructor.findOne({ slug });
    let counter = 1;
    
    while (slugExists) {
      slug = `${slugify(this.title)}-${counter}`;
      slugExists = await this.constructor.findOne({ slug });
      counter++;
    }
    
    this.slug = slug;
  }
  
  next();
});

// Calculate read time based on content
blogSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  next();
});

// Set publishedAt when status becomes PUBLISHED
blogSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'PUBLISHED' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Method to increment view count
blogSchema.methods.incrementViewCount = async function () {
  this.viewCount += 1;
  return await this.save({ validateBeforeSave: false });
};

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
