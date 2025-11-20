import Category from '../models/Category.js';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../utils/errorHandler.js';

/**
 * Category Service
 * Contains all business logic for category operations
 */

class CategoryService {
  /**
   * Get all active categories sorted by order
   * @returns {Promise<Array>} Array of categories
   */
  async getAllCategories() {
    return await Category.find({ isActive: true }).sort('order');
  }

  /**
   * Get category tree structure
   * @returns {Promise<Array>} Category tree
   */
  async getCategoryTree() {
    return await Category.getCategoryTree();
  }

  /**
   * Get root categories only
   * @returns {Promise<Array>} Root categories
   */
  async getRootCategories() {
    return await Category.getRootCategories();
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category object
   * @throws {BadRequestError} If ID is invalid
   * @throws {NotFoundError} If category not found
   */
  async getCategoryById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const category = await Category.findById(id);
    
    if (!category) {
      throw new NotFoundError('Không tìm thấy danh mục');
    }

    return category;
  }

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object>} Category object
   * @throws {NotFoundError} If category not found
   */
  async getCategoryBySlug(slug) {
    const category = await Category.findOne({ slug, isActive: true });
    
    if (!category) {
      throw new NotFoundError('Không tìm thấy danh mục');
    }

    return category;
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  async createCategory(categoryData) {
    const category = new Category(categoryData);
    return await category.save();
  }

  /**
   * Update category by ID
   * @param {string} id - Category ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated category
   * @throws {BadRequestError} If ID is invalid
   * @throws {NotFoundError} If category not found
   */
  async updateCategory(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      throw new NotFoundError('Không tìm thấy danh mục');
    }

    return updatedCategory;
  }

  /**
   * Delete category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Deleted category
   * @throws {BadRequestError} If ID is invalid
   * @throws {NotFoundError} If category not found
   */
  async deleteCategory(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      throw new NotFoundError('Không tìm thấy danh mục');
    }

    return deletedCategory;
  }
}

// Export singleton instance
export default new CategoryService();
