import { StatusCodes } from 'http-status-codes';
import blogInteractionService from '../services/blogInteractionService.js';

/**
 * Blog Interaction Controller
 * Handlers for Like and Bookmark toggles
 */

// @desc    Toggle Like on a blog post
// @route   POST /api/v1/blog-interactions/like/:blogId
// @access  Private
export const toggleLike = async (req, res, next) => {
    try {
        const { blogId } = req.params;
        const userId = req.user.userId;

        const result = await blogInteractionService.toggleInteraction(userId, blogId, 'LIKE');
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle Bookmark on a blog post
// @route   POST /api/v1/blog-interactions/bookmark/:blogId
// @access  Private
export const toggleBookmark = async (req, res, next) => {
    try {
        const { blogId } = req.params;
        const userId = req.user.userId;

        const result = await blogInteractionService.toggleInteraction(userId, blogId, 'BOOKMARK');
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's interaction status for specific blogs
// @route   POST /api/v1/blog-interactions/status
// @access  Private
export const getMyInteractions = async (req, res, next) => {
    try {
        const { blogIds } = req.body;
        const userId = req.user.userId;

        if (!Array.isArray(blogIds)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'blogIds must be an array' });
        }

        const statuses = await blogInteractionService.getUserInteractions(userId, blogIds);
        res.status(StatusCodes.OK).json({ success: true, statuses });
    } catch (error) {
        next(error);
    }
};
