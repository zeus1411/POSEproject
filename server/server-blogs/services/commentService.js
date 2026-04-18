import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../utils/errorHandler.js';

/**
 * Comment Service
 * Handles business logic for blog comments
 */
class CommentService {
  /**
   * Create a new comment
   * @param {string} blogId 
   * @param {string} userId 
   * @param {string} content 
   * @returns {Promise<Object>}
   */
  async createComment(blogId, userId, content) {
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      throw new BadRequestError('ID bài viết không hợp lệ');
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    const comment = await Comment.create({
      blog: blogId,
      author: userId,
      content
    });

    // Increment comment count in blog
    await Blog.findByIdAndUpdate(blogId, { $inc: { commentCount: 1 } });

    return await comment.populate('author', 'username fullName avatar');
  }

  /**
   * Get comments by blog ID
   * @param {string} blogId 
   * @param {Object} query (page, limit)
   * @returns {Promise<Object>}
   */
  async getCommentsByBlog(blogId, query = {}) {
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      throw new BadRequestError('ID bài viết không hợp lệ');
    }

    const { page = 1, limit = 20 } = query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * pageSize;

    const [comments, total] = await Promise.all([
      Comment.find({ blog: blogId, status: 'ACTIVE' })
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Comment.countDocuments({ blog: blogId, status: 'ACTIVE' })
    ]);

    return {
      comments,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / pageSize),
        limit: pageSize
      }
    };
  }

  /**
   * Delete comment (Author or Admin)
   * @param {string} id 
   * @param {string} userId 
   * @param {string} userRole 
   * @returns {Promise<Object>}
   */
  async deleteComment(id, userId, userRole) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID bình luận không hợp lệ');
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      throw new NotFoundError('Không tìm thấy bình luận');
    }

    // Authorization check: Only author or admin
    if (userRole !== 'admin' && comment.author.toString() !== userId) {
      throw new UnauthorizedError('Bạn không có quyền xóa bình luận này');
    }

    // Capture blogId before deletion
    const blogId = comment.blog;

    await Comment.findByIdAndDelete(id);

    // Decrement comment count in blog
    await Blog.findByIdAndUpdate(blogId, { $inc: { commentCount: -1 } });

    return { success: true, message: 'Xóa bình luận thành công' };
  }
}

export default new CommentService();
