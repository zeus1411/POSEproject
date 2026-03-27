import Tag from '../models/Tag.js';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../utils/errorHandler.js';

/**
 * Tag Service
 * Contains all business logic for tag operations
 */

class TagService {
  /**
   * Get all tags
   * @param {Object} query - Query parameters (all, page, limit)
   * @returns {Promise<Object>} List of tags and pagination info
   */
  async getAllTags(query = {}) {
    const { all, page = 1, limit = 20 } = query;

    if (all === 'true') {
      const tags = await Tag.find().sort({ name: 1 });
      return { tags, total: tags.length };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * pageSize;

    const [tags, total] = await Promise.all([
      Tag.find().sort({ name: 1 }).skip(skip).limit(pageSize),
      Tag.countDocuments()
    ]);

    return {
      tags,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / pageSize),
        limit: pageSize
      }
    };
  }

  /**
   * Get tag by ID
   * @param {string} id - Tag ID
   * @returns {Promise<Object>} Tag object
   */
  async getTagById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const tag = await Tag.findById(id);
    if (!tag) {
      throw new NotFoundError('Không tìm thấy thẻ (tag)');
    }

    return tag;
  }

  /**
   * Create new tag
   * @param {Object} data - Tag data
   * @returns {Promise<Object>} Created tag
   */
  async createTag(data) {
    const { name } = data;
    if (!name) {
      throw new BadRequestError('Vui lòng cung cấp tên thẻ');
    }

    const existing = await Tag.findOne({ name });
    if (existing) {
      throw new BadRequestError('Tên thẻ này đã tồn tại');
    }

    const tag = await Tag.create(data);
    return tag;
  }

  /**
   * Update tag
   * @param {string} id - Tag ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated tag
   */
  async updateTag(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const tag = await Tag.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!tag) {
      throw new NotFoundError('Không tìm thấy thẻ (tag)');
    }

    return tag;
  }

  /**
   * Delete tag
   * @param {string} id - Tag ID
   * @returns {Promise<Object>} Result message
   */
  async deleteTag(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const tag = await Tag.findByIdAndDelete(id);
    if (!tag) {
      throw new NotFoundError('Không tìm thấy thẻ (tag)');
    }

    return { success: true, message: 'Xóa thẻ thành công' };
  }
}

export default new TagService();
