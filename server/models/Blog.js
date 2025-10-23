import mongoose from 'mongoose';

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
      required: [true, 'Vui lòng nhập mô tả ngắn'],
      trim: true,
      maxlength: [500, 'Mô tả ngắn không được vượt quá 500 ký tự']
    },
    content: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung bài viết']
    },
    author: {
      type: String,
      required: true,
      default: 'Admin'
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    coverImage: {
      url: String,
      publicId: String,
      alt: String
    },
    images: [
      {
        url: String,
        publicId: String,
        caption: String
      }
    ],
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
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
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    commentCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: Date,
    isFeatured: {
      type: Boolean,
      default: false
    },
    readTime: {
      type: Number, // in minutes
      default: 5
    },
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    relatedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
      }
    ],
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate comments
blogSchema.virtual('comments', {
  ref: 'BlogComment',
  localField: '_id',
  foreignField: 'blogId'
});

// Indexes
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
blogSchema.index({ slug: 1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ viewCount: -1 });
blogSchema.index({ likeCount: -1 });
blogSchema.index({ categoryId: 1 });

// Generate slug before saving
blogSchema.pre('save', async function (next) {
  if (this.isModified('title') && !this.slug) {
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

// Set publishedAt when status changes to published
blogSchema.pre('save', function (next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
    this.status = 'PUBLISHED';
  }
  
  if (this.isModified('isPublished') && !this.isPublished) {
    this.status = 'DRAFT';
  }
  
  next();
});

// Method to increment view count
blogSchema.methods.incrementViewCount = async function () {
  this.viewCount += 1;
  await this.save({ validateBeforeSave: false });
  
  return this;
};

// Method to like post
blogSchema.methods.likePost = async function (userId) {
  if (!this.likedBy.includes(userId)) {
    this.likedBy.push(userId);
    this.likeCount += 1;
    await this.save();
  }
  
  return this;
};

// Method to unlike post
blogSchema.methods.unlikePost = async function (userId) {
  const index = this.likedBy.indexOf(userId);
  
  if (index > -1) {
    this.likedBy.splice(index, 1);
    this.likeCount = Math.max(0, this.likeCount - 1);
    await this.save();
  }
  
  return this;
};

// Method to update comment count
blogSchema.methods.updateCommentCount = async function () {
  const BlogComment = mongoose.model('BlogComment');
  
  const count = await BlogComment.countDocuments({
    blogId: this._id,
    status: 'APPROVED'
  });
  
  this.commentCount = count;
  await this.save({ validateBeforeSave: false });
  
  return this;
};

// Static method to get published posts
blogSchema.statics.getPublishedPosts = function (options = {}) {
  const { limit = 10, page = 1, tag, categoryId } = options;
  const query = { isPublished: true };
  
  if (tag) {
    query.tags = tag;
  }
  
  if (categoryId) {
    query.categoryId = categoryId;
  }
  
  return this.find(query)
    .populate('authorId', 'username avatar')
    .populate('categoryId', 'name slug')
    .sort('-publishedAt')
    .limit(limit)
    .skip((page - 1) * limit);
};

// Static method to get featured posts
blogSchema.statics.getFeaturedPosts = function (limit = 5) {
  return this.find({ 
    isPublished: true, 
    isFeatured: true 
  })
    .populate('authorId', 'username avatar')
    .sort('-publishedAt')
    .limit(limit);
};

// Static method to get popular posts
blogSchema.statics.getPopularPosts = function (limit = 5) {
  return this.find({ isPublished: true })
    .populate('authorId', 'username avatar')
    .sort('-viewCount -likeCount')
    .limit(limit);
};

// Static method to get related posts
blogSchema.statics.getRelatedPosts = async function (blogId, limit = 4) {
  const blog = await this.findById(blogId);
  
  if (!blog) return [];
  
  return this.find({
    _id: { $ne: blogId },
    isPublished: true,
    $or: [
      { tags: { $in: blog.tags } },
      { categoryId: blog.categoryId }
    ]
  })
    .sort('-publishedAt')
    .limit(limit);
};

// Static method to search posts
blogSchema.statics.searchPosts = function (searchTerm, options = {}) {
  const { limit = 10, page = 1 } = options;
  
  return this.find(
    { 
      $text: { $search: searchTerm },
      isPublished: true
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .skip((page - 1) * limit);
};

// Static method to get all tags
blogSchema.statics.getAllTags = async function () {
  const blogs = await this.find({ isPublished: true }, 'tags');
  const tagsSet = new Set();
  
  blogs.forEach(blog => {
    blog.tags.forEach(tag => tagsSet.add(tag));
  });
  
  return Array.from(tagsSet).sort();
};

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;