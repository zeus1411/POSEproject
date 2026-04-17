import BlogInteraction from '../models/BlogInteraction.js';
import Blog from '../models/Blog.js';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../../utils/errorHandler.js';

/**
 * Blog Interaction Service
 * Handles Likes and Bookmarks for blog posts
 */
class BlogInteractionService {
  /**
   * Toggle a blog interaction (LIKE or BOOKMARK)
   * @param {string} userId - User performing the action
   * @param {string} blogId - Target blog post
   * @param {string} type - Interaction type ('LIKE' or 'BOOKMARK')
   * @returns {Promise<Object>} Updated counts and user status
   */
  async toggleInteraction(userId, blogId, type) {
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      throw new BadRequestError('ID bài viết không hợp lệ');
    }

    if (!['LIKE', 'BOOKMARK'].includes(type)) {
      throw new BadRequestError('Loại tương tác không hợp lệ');
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new NotFoundError('Không tìm thấy bài viết');
    }

    // Find existing interaction
    const existing = await BlogInteraction.findOne({
      userId,
      blogId,
      type
    });

    let isActed = false;
    const countField = type === 'LIKE' ? 'likeCount' : 'bookmarkCount';

    if (existing) {
      // Remove interaction (Toggle off)
      await BlogInteraction.findByIdAndDelete(existing._id);
      await Blog.findByIdAndUpdate(blogId, { $inc: { [countField]: -1 } });
      isActed = false;
    } else {
      // Create interaction (Toggle on)
      await BlogInteraction.create({
        userId,
        blogId,
        type
      });
      await Blog.findByIdAndUpdate(blogId, { $inc: { [countField]: 1 } });
      isActed = true;
    }

    // Get updated blog to return latest counts
    const updatedBlog = await Blog.findById(blogId).select('likeCount bookmarkCount');

    return {
      success: true,
      type,
      isActed,
      newCount: updatedBlog[countField],
      counts: {
        likes: updatedBlog.likeCount,
        bookmarks: updatedBlog.bookmarkCount
      }
    };
  }

  /**
   * Get user interactions for a list of blogs (useful for UI icons)
   * @param {string} userId 
   * @param {Array<string>} blogIds 
   * @returns {Promise<Object>} Map of interactions
   */
  async getUserInteractions(userId, blogIds) {
    const interactions = await BlogInteraction.find({
      userId,
      blogId: { $in: blogIds }
    });

    // Structure: { [blogId]: { isLiked: true, isBookmarked: false } }
    const result = {};
    blogIds.forEach(id => {
      result[id] = { isLiked: false, isBookmarked: false };
    });

    interactions.forEach(inter => {
      if (inter.type === 'LIKE') result[inter.blogId].isLiked = true;
      if (inter.type === 'BOOKMARK') result[inter.blogId].isBookmarked = true;
    });

    return result;
  }
}

export default new BlogInteractionService();
