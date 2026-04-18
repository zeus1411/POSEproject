import Blog from '../models/Blog.js';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../utils/errorHandler.js';
import { deleteFromCloudinary } from '../../utils/cloudinaryUtils.js';

/**
 * Blog Service
 * Contains business logic for Blog post operations
 */
class BlogService {
  /**
   * Create a new blog post
   * @param {Object} data - Blog data
   * @param {Object} file - Uploaded cover image file
   * @param {string} userId - Author ID
   * @returns {Promise<Object>} Created blog
   */
  async createBlog(data, file, userId) {
    if (!file) {
      throw new BadRequestError('Vui lòng tải lên ảnh bìa cho bài viết');
    }

    const { title, content, category, tags, status, excerpt, relatedProducts } = data;

    // Handle tags (support both stringified array and real array)
    let processedTags = tags;
    if (typeof tags === 'string') {
      try {
        processedTags = JSON.parse(tags);
      } catch (e) {
        processedTags = tags.split(',').map(t => t.trim());
      }
    }

    // Handle relatedProducts
    let processedRelatedProducts = [];
    if (relatedProducts) {
      if (typeof relatedProducts === 'string') {
        try {
          processedRelatedProducts = JSON.parse(relatedProducts);
        } catch (e) {
          processedRelatedProducts = relatedProducts.split(',').map(id => id.trim());
        }
      } else if (Array.isArray(relatedProducts)) {
        processedRelatedProducts = relatedProducts;
      }
    }

    const blogData = {
      title,
      content,
      excerpt,
      category,
      tags: processedTags,
      status: status || 'DRAFT',
      author: userId,
      coverImage: {
        url: file.path,
        publicId: file.filename
      },
      relatedProducts: processedRelatedProducts
    };

    const blog = await Blog.create(blogData);
    return blog;
  }

  /**
   * Get all blogs with filters and pagination
   * @param {Object} query - Query parameters (status, category, tag, page, limit)
   * @param {string} userRole - Role of the requester
   * @param {string} userId - ID of the requester
   * @returns {Promise<Object>} List of blogs and pagination info
   */
  async getAllBlogs(query = {}, userRole = 'user', userId = null) {
    const { status, category, tag, page = 1, limit = 10, search } = query;

    const filter = {};

    // Access control: Guest/User can only see PUBLISHED
    if (userRole !== 'admin') {
      filter.$or = [
        { status: 'PUBLISHED' }
      ];
      // Authors can see their own DRAFT/PENDING
      if (userId) {
        filter.$or.push({ author: userId });
      }
    } else if (status) {
      filter.status = status;
    }

    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * pageSize;

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'username fullName avatar')
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Blog.countDocuments(filter)
    ]);

    return {
      blogs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / pageSize),
        limit: pageSize
      }
    };
  }

  /**
   * Get public blogs (Only PUBLISHED)
   * @param {Object} query - Query parameters (category, tag, page, limit, search)
   * @returns {Promise<Object>} List of blogs and pagination info
   */
  async getPublicBlogs(query = {}) {
    const { category, tag, page = 1, limit = 10, search } = query;

    const filter = { status: 'PUBLISHED' };

    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    
    // Search by title specifically as requested
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * pageSize;

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'username fullName avatar')
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .populate('relatedProducts', 'name price images sku slug discount originalPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Blog.countDocuments(filter)
    ]);

    return {
      blogs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / pageSize),
        limit: pageSize
      }
    };
  }

  /**
   * Get blog by ID
   * @param {string} id - Blog ID
   * @returns {Promise<Object>} Blog object
   */
  async getBlogById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const blog = await Blog.findById(id)
      .populate('author', 'username fullName avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .populate('relatedProducts', 'name price images sku slug discount originalPrice');

    if (!blog) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    // Increment view count (async, don't block response)
    blog.incrementViewCount().catch(err => console.error('Error incrementing view count:', err));

    return blog;
  }

  /**
   * Get blog by slug
   * @param {string} slug - Blog slug
   * @returns {Promise<Object>} Blog object
   */
  async getBlogBySlug(slug) {
    const blog = await Blog.findOne({ slug, status: 'PUBLISHED' })
      .populate('author', 'username fullName avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .populate('relatedProducts', 'name price images sku slug discount originalPrice');

    if (!blog) {
      throw new NotFoundError('Không tìm thấy bài viết hoặc bài viết chưa được công bố');
    }

    // Increment view count
    blog.incrementViewCount().catch(err => console.error('Error incrementing view count:', err));

    return blog;
  }

  /**
   * Update blog post
   * @param {string} id - Blog ID
   * @param {Object} data - Update data
   * @param {Object} file - New cover image (optional)
   * @param {string} userId - Requester ID
   * @param {string} userRole - Requester role
   * @returns {Promise<Object>} Updated blog
   */
  async updateBlog(id, data, file, userId, userRole) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    // Authorization check: Only author or admin
    if (userRole !== 'admin' && blog.author.toString() !== userId) {
      throw new UnauthorizedError('Bạn không có quyền chỉnh sửa bài viết này');
    }

    // Handle file upload if provided
    if (file) {
      // Delete old image from Cloudinary
      if (blog.coverImage && blog.coverImage.publicId) {
        await deleteFromCloudinary(blog.coverImage.publicId).catch(err =>
          console.error('Error deleting old blog image:', err)
        );
      }
      data.coverImage = {
        url: file.path,
        publicId: file.filename
      };
    }

    // Handle tags if provided
    if (data.tags && typeof data.tags === 'string') {
      try {
        data.tags = JSON.parse(data.tags);
      } catch (e) {
        data.tags = data.tags.split(',').map(t => t.trim());
      }
    }

    // Handle relatedProducts if provided
    if (data.relatedProducts) {
      if (typeof data.relatedProducts === 'string') {
        try {
          data.relatedProducts = JSON.parse(data.relatedProducts);
        } catch (e) {
          data.relatedProducts = data.relatedProducts.split(',').map(id => id.trim());
        }
      }
    }

    // Ensure status safety (Users can't set status to PUBLISHED themselves if we wanted moderation)
    // For now, I'll allow it if they are admin, or keep it PENDING if they are user.
    if (userRole !== 'admin' && data.status === 'PUBLISHED') {
      data.status = 'PENDING';
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('author category tags')
    .populate('relatedProducts', 'name price images sku slug discount originalPrice');

    return updatedBlog;
  }

  /**
   * Delete blog post
   * @param {string} id - Blog ID
   * @param {string} userId - Requester ID
   * @param {string} userRole - Requester role
   * @returns {Promise<Object>} Success message
   */
  async deleteBlog(id, userId, userRole) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    // Authorization check
    if (userRole !== 'admin' && blog.author.toString() !== userId) {
      throw new UnauthorizedError('Bạn không có quyền xóa bài viết này');
    }

    // Delete image from Cloudinary
    if (blog.coverImage && blog.coverImage.publicId) {
      await deleteFromCloudinary(blog.coverImage.publicId).catch(err =>
        console.error('Error deleting blog image on delete:', err)
      );
    }

    await Blog.findByIdAndDelete(id);
    return { success: true, message: 'Xóa bài viết thành công' };
  }
}

export default new BlogService();