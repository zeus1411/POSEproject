import categoryService from '../services/categoryService.js';

/**
 * Category Controller
 * Handles HTTP requests and responses
 * Business logic is in categoryService
 */

// Get all categories
export const getCategories = async (req, res, next) => {
    try {
        const includeInactive = req.query.includeInactive === 'true';
        const categories = await categoryService.getAllCategories(includeInactive);
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

// Get category tree
export const getCategoryTree = async (req, res, next) => {
    try {
        const tree = await categoryService.getCategoryTree();
        res.status(200).json(tree);
    } catch (error) {
        next(error);
    }
};

// Get root categories
export const getRootCategories = async (req, res, next) => {
    try {
        const rootCategories = await categoryService.getRootCategories();
        res.status(200).json(rootCategories);
    } catch (error) {
        next(error);
    }
};

// Get category by ID
export const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

// Get category by slug
export const getCategoryBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const category = await categoryService.getCategoryBySlug(slug);
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

// Create category (Admin only)
export const createCategory = async (req, res, next) => {
    try {
        const savedCategory = await categoryService.createCategory(req.body);
        res.status(201).json(savedCategory);
    } catch (error) {
        next(error);
    }
};

// Update category (Admin only)
export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedCategory = await categoryService.updateCategory(id, req.body);
        res.status(200).json(updatedCategory);
    } catch (error) {
        next(error);
    }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        await categoryService.deleteCategory(id);
        res.status(200).json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
        next(error);
    }
};

// Update category status (Admin only)
export const updateCategoryStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const updatedCategory = await categoryService.updateCategoryStatus(id, isActive);
        res.status(200).json(updatedCategory);
    } catch (error) {
        next(error);
    }
};
