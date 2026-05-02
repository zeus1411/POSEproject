import { StatusCodes } from 'http-status-codes';
import commentService from '../services/commentService.js';

/**
 * Comment Controller
 * Handles HTTP requests and responses for blog comments
 */

// @desc    Create a new comment
// @route   POST /api/v1/comments
// @access  Private
export const createComment = async (req, res, next) => {
    try {
        const { blogId, content, parentId } = req.body;
        const userId = req.user.userId;

        const comment = await commentService.createComment(blogId, userId, content, parentId);
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Đăng bình luận thành công',
            comment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get comments for a blog
// @route   GET /api/v1/comments/blog/:blogId
// @access  Public
export const getBlogComments = async (req, res, next) => {
    try {
        const { blogId } = req.params;
        const result = await commentService.getCommentsByBlog(blogId, req.query);
        res.status(StatusCodes.OK).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Admin delete comment
// @route   DELETE /api/v1/comments/:id
// @access  Private (Admin)
export const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const result = await commentService.deleteComment(id, userId, userRole);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const updateComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;

        const updatedComment = await commentService.updateComment(id, userId, content);
        res.status(StatusCodes.OK).json(updatedComment);
    } catch (error) {
        next(error);
    }
};