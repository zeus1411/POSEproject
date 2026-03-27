import { StatusCodes } from 'http-status-codes';
import blogService from '../services/blogService.js';
import { deleteFromCloudinary } from '../utils/cloudinaryUtils.js';

/**
 * Blog Controller
 * Handles HTTP requests and responses for blog posts
 */

// @desc    Create a new blog post
// @route   POST /api/v1/blogs
// @access  Private
export const createBlog = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const file = req.file;

        const blog = await blogService.createBlog(req.body, file, userId);
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Tạo bài viết thành công',
            blog
        });
    } catch (error) {
        // Clean up uploaded file if there was an error
        if (req.file) {
            await deleteFromCloudinary(req.file.filename).catch(cleanupError => 
                console.error('Error cleaning up uploaded blog image:', cleanupError)
            );
        }
        next(error);
    }
};

// @desc    Get all blogs
// @route   GET /api/v1/blogs
// @access  Public
export const getAllBlogs = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role || 'user';
        
        const result = await blogService.getAllBlogs(req.query, userRole, userId);
        res.status(StatusCodes.OK).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get blog by ID
// @route   GET /api/v1/blogs/:id
// @access  Public
export const getBlogById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const blog = await blogService.getBlogById(id);
        res.status(StatusCodes.OK).json({
            success: true,
            blog
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get blog by slug
// @route   GET /api/v1/blogs/slug/:slug
// @access  Public
export const getBlogBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const blog = await blogService.getBlogBySlug(slug);
        res.status(StatusCodes.OK).json({
            success: true,
            blog
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update blog post
// @route   PUT /api/v1/blogs/:id
// @access  Private (Author/Admin)
export const updateBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        const file = req.file;

        const updatedBlog = await blogService.updateBlog(id, req.body, file, userId, userRole);
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Cập nhật bài viết thành công',
            blog: updatedBlog
        });
    } catch (error) {
        // Clean up uploaded file if there was an error
        if (req.file) {
            await deleteFromCloudinary(req.file.filename).catch(cleanupError => 
                console.error('Error cleaning up uploaded blog image on update:', cleanupError)
            );
        }
        next(error);
    }
};

// @desc    Delete blog post
// @route   DELETE /api/v1/blogs/:id
// @access  Private (Author/Admin)
export const deleteBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const result = await blogService.deleteBlog(id, userId, userRole);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};
