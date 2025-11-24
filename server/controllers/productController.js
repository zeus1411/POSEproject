import productService from '../services/productService.js';
import { deleteFromCloudinary } from '../utils/cloudinaryUtils.js';

// Create a new product
export const createProduct = async (req, res, next) => {
    try {
        const files = req.files;
        const userId = req.user?.userId;
        
        const savedProduct = await productService.createProduct(req.body, files, userId);
        res.status(201).json(savedProduct);
    } catch (error) {
        // Clean up uploaded files if there was an error
        if (req.files && req.files.length > 0) {
            try {
                const publicIds = req.files.map(file => file.filename);
                await deleteFromCloudinary(publicIds);
            } catch (cleanupError) {
                console.error('Error cleaning up uploaded files:', cleanupError);
            }
        }
        next(error);
    }
};

// Get all products
export const getProducts = async (req, res, next) => {
    try {
        const isAdmin = req.user?.role === 'admin';
        const includeInactive = req.query.includeInactive === 'true';
        
        const products = await productService.getAllProducts(isAdmin, includeInactive);
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

// Get product by ID
export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { includeInactive } = req.query;
        const isAdmin = req.user?.role === 'admin';
        
        console.log('🎯 Controller getProductById:', { id, includeInactive, isAdmin, role: req.user?.role });
        
        const product = await productService.getProductById(id, isAdmin, includeInactive === 'true');
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

// Update product by ID
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const files = req.files;
        
        const updatedProduct = await productService.updateProduct(id, req.body, files);
        res.status(200).json(updatedProduct);
    } catch (error) {
        // Clean up uploaded files if there was an error
        if (req.files && req.files.length > 0) {
            try {
                const publicIds = req.files.map(file => file.filename);
                await deleteFromCloudinary(publicIds);
            } catch (cleanupError) {
                console.error('Error cleaning up uploaded files:', cleanupError);
            }
        }
        next(error);
    }
};

/**
 * Update product images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateProductImages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { imageUrls } = req.body;
        
        const product = await productService.updateProductImages(id, imageUrls);

        res.status(200).json({ 
            success: true, 
            message: 'Cập nhật ảnh sản phẩm thành công', 
            product 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Upload product images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const uploadProductImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return next(); // No files to process, move to next middleware
        }

        // Map the uploaded files to their URLs
        req.body.images = req.files.map(file => file.path);
        next();
    } catch (error) {
        console.error('Error processing uploaded files:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi xử lý tệp tải lên',
            error: error.message 
        });
    }
};

// Delete product by ID
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        await productService.deleteProduct(id);

        res.status(200).json({ 
            success: true,
            message: 'Xóa sản phẩm thành công' 
        });
    } catch (error) {
        next(error);
    }
};

// Search & Filter products with pagination
export const searchProducts = async (req, res, next) => {
    try {
        const isAdmin = req.user?.role === 'admin';
        
        const result = await productService.searchProducts(req.query, isAdmin);
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

// ==================== PRODUCT VARIANTS MANAGEMENT ====================

// @desc    Add/Update product variants and options
// @route   PUT /api/v1/products/:id/variants
// @access  Private (Admin)
export const updateProductVariants = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { hasVariants, options, variants } = req.body;

        const product = await productService.updateProductVariants(id, { hasVariants, options, variants });

        res.status(200).json({
            success: true,
            message: 'Cập nhật variants thành công',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a single variant to product
// @route   POST /api/v1/products/:id/variants
// @access  Private (Admin)
export const addVariant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const variantData = req.body;

        const product = await productService.addVariant(id, variantData);

        res.status(201).json({
            success: true,
            message: 'Thêm variant thành công',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a specific variant
// @route   PUT /api/v1/products/:id/variants/:variantId
// @access  Private (Admin)
export const updateVariant = async (req, res, next) => {
    try {
        const { id, variantId } = req.params;
        const updateData = req.body;

        const product = await productService.updateVariant(id, variantId, updateData);

        res.status(200).json({
            success: true,
            message: 'Cập nhật variant thành công',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a specific variant
// @route   DELETE /api/v1/products/:id/variants/:variantId
// @access  Private (Admin)
export const deleteVariant = async (req, res, next) => {
    try {
        const { id, variantId } = req.params;

        const product = await productService.deleteVariant(id, variantId);

        res.status(200).json({
            success: true,
            message: 'Xóa variant thành công',
            data: product
        });
    } catch (error) {
        next(error);
    }
};
