import { StatusCodes } from 'http-status-codes';
import blogCategoryService from '../services/blogCategoryService.js';

/**
 * Blog Category Controller
 * Handles HTTP requests and responses for blog categories
 */

// @desc    Get all blog categories
// @route   GET /api/v1/blog-categories
// @access  Public
export const getAllBlogCategories = async (req, res, next) => {
    try {
        const result = await blogCategoryService.getAllBlogCategories(req.query);
        res.status(StatusCodes.OK).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get blog category by ID
// @route   GET /api/v1/blog-categories/:id
// @access  Public
export const getBlogCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await blogCategoryService.getBlogCategoryById(id);
        res.status(StatusCodes.OK).json({
            success: true,
            category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new blog category
// @route   POST /api/v1/blog-categories
// @access  Private (Admin)
export const createBlogCategory = async (req, res, next) => {
    try {
        const category = await blogCategoryService.createBlogCategory(req.body);
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Tạo danh mục bài viết thành công',
            category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update blog category
// @route   PUT /api/v1/blog-categories/:id
// @access  Private (Admin)
export const updateBlogCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await blogCategoryService.updateBlogCategory(id, req.body);
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Cập nhật danh mục bài viết thành công',
            category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update blog category status
// @route   PATCH /api/v1/blog-categories/:id/status
// @access  Private (Admin)
export const updateCategoryStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const category = await blogCategoryService.updateCategoryStatus(id, status);
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Cập nhật trạng thái danh mục thành công',
            category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete blog category
// @route   DELETE /api/v1/blog-categories/:id
// @access  Private (Admin)
export const deleteBlogCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await blogCategoryService.deleteBlogCategory(id);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

