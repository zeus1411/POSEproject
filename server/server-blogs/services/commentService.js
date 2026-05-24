import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../utils/errorHandler.js';
import Notification from '../../server-ecommerce/models/Notification.js';

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
  async createComment(blogId, userId, content, parentId = null) {
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      throw new BadRequestError('ID bài viết không hợp lệ');
    }

    const blog = await Blog.findById(blogId)
      .populate('author', 'username fullName');
    if (!blog) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    const comment = await Comment.create({
      blog: blogId,
      author: userId,
      content,
      parentId: parentId || null
    });

    // Increment comment count in blog
    await Blog.findByIdAndUpdate(blogId, { $inc: { commentCount: 1 } });

    const populatedComment = await comment.populate('author', 'username fullName avatar');

    Notification.createBlogCommentNotificationForAuthor(
      blog.author._id,
      userId,
      blog._id,
      blog.title,
      blog.slug,
      comment._id,
      populatedComment.author.fullName || populatedComment.author.username
    ).catch(err => console.error('Error triggering blog comment notification:', err));

    return populatedComment;
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

    const { page = 1, limit = 50 } = query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * pageSize;

    // 1. Lấy ALL comments của blog (KHÔNG paginate tree trước khi build)
    const [allComments, total] = await Promise.all([
      Comment.find({ blog: blogId, status: 'ACTIVE' })
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 }),
      Comment.countDocuments({ blog: blogId, status: 'ACTIVE' })
    ]);

    // 2. Convert sang map để build tree
    const commentMap = {};
    const roots = [];

    allComments.forEach(c => {
      commentMap[c._id.toString()] = {
        _id: c._id,
        content: c.content,
        createdAt: c.createdAt,
        author: c.author,
        parentId: c.parentId,
        replies: []
      };
    });

    // 3. Build tree structure
    allComments.forEach(c => {
      if (c.parentId) {
        const parent = commentMap[c.parentId];
        if (parent) {
          parent.replies.push(commentMap[c._id.toString()]);
        }
      } else {
        roots.push(commentMap[c._id]);
      }
    });

    // 4. Pagination cho ROOT comments (giống Facebook feed)
    const paginatedRoots = roots.slice(skip, skip + pageSize);

    return {
      comments: paginatedRoots,
      pagination: {
        total: roots.length,
        page: pageNum,
        pages: Math.ceil(roots.length / pageSize),
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

  async updateComment(id, userId, content) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError('ID bình luận không hợp lệ');
    
    const comment = await Comment.findById(id);
    if (!comment) throw new NotFoundError('Không tìm thấy bình luận');

    // Chỉ tác giả mới được sửa
    if (comment.author.toString() !== userId) {
      throw new UnauthorizedError('Bạn không có quyền sửa bình luận này');
    }

    comment.content = content;
    await comment.save();
    return comment;
  }
}

export default new CommentService();
