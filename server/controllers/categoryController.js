import Category from '../models/Category.js';
import mongoose from 'mongoose';

// Get all categories
export const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true }).sort('order');
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

// Get category tree
export const getCategoryTree = async (req, res, next) => {
    try {
        const tree = await Category.getCategoryTree();
        res.status(200).json(tree);
    } catch (error) {
        next(error);
    }
};

// Get root categories
export const getRootCategories = async (req, res, next) => {
    try {
        const rootCategories = await Category.getRootCategories();
        res.status(200).json(rootCategories);
    } catch (error) {
        next(error);
    }
};

// Get category by ID
export const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const isValidId = mongoose.Types.ObjectId.isValid(id);
        if (!isValidId) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        }

        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

// Get category by slug
export const getCategoryBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const category = await Category.findOne({ slug, isActive: true });
        if (!category) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        }

        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

// Create category (Admin only)
export const createCategory = async (req, res, next) => {
    try {
        const category = new Category(req.body);
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        next(error);
    }
};

// Update category (Admin only)
export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const isValidId = mongoose.Types.ObjectId.isValid(id);
        if (!isValidId) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        next(error);
    }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const isValidId = mongoose.Types.ObjectId.isValid(id);
        if (!isValidId) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }

        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        }

        res.status(200).json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
        next(error);
    }
};
