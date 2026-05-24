import BlogCategory from '../models/BlogCategory.js';
import Blog from '../models/Blog.js';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../../utils/errorHandler.js';

const attachBlogCounts = async (categories) => {
  const counts = await Blog.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  const countByCategoryId = new Map(
    counts.filter(item => item._id).map(item => [item._id.toString(), item.count])
  );

  return categories.map(category => ({
    ...(category.toObject ? category.toObject() : category),
    blogCount: countByCategoryId.get(category._id.toString()) || 0
  }));
};

/**
 * Blog Category Service
 * Contains all business logic for blog category operations
 */

class BlogCategoryService {
  /**
   * Get all blog categories
   * @param {Object} query - Query parameters (all, page, limit)
   * @returns {Promise<Object>} List of categories and pagination info
   */
  async getAllBlogCategories(query = {}) {
    const { all, page = 1, limit = 10 } = query;

    if (all === 'true') {
      const categories = await BlogCategory.find().sort({ name: 1 });
      return { categories: await attachBlogCounts(categories), total: categories.length };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * pageSize;

    const [categories, total] = await Promise.all([
      BlogCategory.find().sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      BlogCategory.countDocuments()
    ]);

    return {
      categories: await attachBlogCounts(categories),
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / pageSize),
        limit: pageSize
      }
    };
  }

  /**
   * Get blog category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category object
   */
  async getBlogCategoryById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const category = await BlogCategory.findById(id);
    if (!category) {
      throw new NotFoundError('Không tìm thấy danh mục bài viết');
    }

    return category;
  }

  /**
   * Create new blog category
   * @param {Object} data - Category data
   * @returns {Promise<Object>} Created category
   */
  async createBlogCategory(data) {
    const { name } = data;
    if (!name) {
      throw new BadRequestError('Vui lòng cung cấp tên danh mục');
    }

    const existing = await BlogCategory.findOne({ name });
    if (existing) {
      throw new BadRequestError('Tên danh mục đã tồn tại');
    }

    const category = await BlogCategory.create(data);
    return category;
  }

  /**
   * Update blog category
   * @param {string} id - Category ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated category
   */
  async updateBlogCategory(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const category = await BlogCategory.findById(id);

    if (!category) {
      throw new NotFoundError('Không tìm thấy danh mục bài viết');
    }

    Object.assign(category, data);
    await category.save();

    return category;
  }

  /**
   * Update blog category status
   * @param {string} id - Category ID
   * @param {string} status - New status (ACTIVE, INACTIVE)
   * @returns {Promise<Object>} Updated category
   */
  async updateCategoryStatus(id, status) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      throw new BadRequestError('Trạng thái không hợp lệ. Phải là ACTIVE hoặc INACTIVE');
    }

    const category = await BlogCategory.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new NotFoundError('Không tìm thấy danh mục bài viết');
    }

    return category;
  }

  /**
   * Delete blog category
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Result message
   */
  async deleteBlogCategory(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const category = await BlogCategory.findByIdAndDelete(id);
    if (!category) {
      throw new NotFoundError('Không tìm thấy danh mục bài viết');
    }

    return { success: true, message: 'Xóa danh mục bài viết thành công' };
  }
}

export default new BlogCategoryService();

