import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { deleteFromCloudinary } from '../utils/cloudinaryUtils.js';

// Create a new product
export const createProduct = async (req, res, next) => {
    try {
        // If there are uploaded files, add their URLs to the images array
        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(file => file.path);
        } else if (req.body.images && !Array.isArray(req.body.images)) {
            // Ensure images is always an array
            req.body.images = [];
        }

        const payload = {
            ...req.body,
            sellerId: req.user?.userId, // already authenticated + authorized as admin
        };
        
        const product = new Product(payload);
        const savedProduct = await product.save();
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
        const filter = {};
        if (!isAdmin || !includeInactive) {
            filter.status = 'ACTIVE';
        }
        const products = await Product.find(filter)
            .sort({ createdAt: -1 });
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
        
        console.log('getProductById - Request received', { 
            id, 
            includeInactive, 
            user: req.user 
        });

        const isAdmin = req.user?.role === 'admin';
        
        const isValidId = mongoose.Types.ObjectId.isValid(id);
        if (!isValidId) {
            console.log('getProductById - Invalid ID:', id);
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }

        const product = await Product.findById(id).populate('categoryId', 'name _id');
        if (!product) {
            console.log('getProductById - Product not found:', id);
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log('getProductById - Found product:', { 
            _id: product._id, 
            name: product.name, 
            status: product.status,
            isAdmin,
            includeInactive
        });

        // Check if user can view this product
        const canViewInactive = isAdmin && includeInactive === 'true';
        if (product.status !== 'ACTIVE' && !canViewInactive) {
            console.log('getProductById - Access denied to inactive product:', {
                productStatus: product.status,
                isAdmin,
                includeInactive
            });
            return res.status(404).json({ message: 'Product not found' });
        }

        // Lazy update viewCount - don't block the response
        Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).catch(() => { });
        
        console.log('getProductById - Sending product data');
        res.status(200).json(product);
    } catch (error) {
        console.error('getProductById - Error:', error);
        next(error);
    }
};

// Update product by ID
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const isValidId = mongoose.Types.ObjectId.isValid(id);
        if (!isValidId) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }

        // If there are new uploaded files, add their URLs to the images array
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => file.path);
            
            // Get the current product to check existing images
            const currentProduct = await Product.findById(id);
            if (!currentProduct) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }
            
            // Combine existing images with new ones (if any)
            req.body.images = [...(Array.isArray(currentProduct.images) ? currentProduct.images : []), ...newImageUrls];
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        
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
        
        if (!imageUrls || !Array.isArray(imageUrls)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Danh sách ảnh không hợp lệ' 
            });
        }

        // Validate each URL is a non-empty string
        if (!imageUrls.every(url => typeof url === 'string' && url.trim().length > 0)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mỗi URL ảnh phải là một chuỗi không rỗng' 
            });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { $set: { images: imageUrls } },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy sản phẩm' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Cập nhật ảnh sản phẩm thành công', 
            product 
        });
    } catch (error) {
        console.error('Error updating product images:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi cập nhật ảnh sản phẩm',
            error: error.message 
        });
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
        const isValidId = mongoose.Types.ObjectId.isValid(id);
        if (!isValidId) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }

        // Get the product first to get the image public IDs
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        // Delete the product
        await Product.findByIdAndDelete(id);

        // Delete associated images from Cloudinary
        // Note: If you need to clean up Cloudinary, you'll need to track public IDs separately
        // since we're now storing only URLs in the images array
        // You might want to maintain a separate collection for tracking Cloudinary assets

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
        const {
            q, // keyword (legacy)
            search, // new keyword parameter
            categoryId,
            minPrice,
            maxPrice,
            inStock, // 'true' | 'false'
            page = 1,
            limit = 12,
            sort // e.g. 'price:asc', 'createdAt:desc'
        } = req.query;

        // Use search parameter if provided, otherwise fall back to q for backward compatibility
        const searchTerm = search || q;

        // Validate keyword input edge cases
        if (searchTerm && typeof searchTerm === 'string') {
            const trimmed = searchTerm.trim();
            if (trimmed.length === 0) {
                return res.status(400).json({ message: 'Vui lòng nhập từ khóa tìm kiếm' });
            }
        }

        const filter = {};
        const isAdmin = req.user?.role === 'admin';
        const includeInactive = req.query.includeInactive === 'true';
        
        // For admin users, show all products by default (both ACTIVE and INACTIVE)
        // Only filter by status if explicitly set in the query
        if (req.query.status !== undefined) {
            // Only add status to filter if it's a non-empty string
            if (req.query.status) {
                filter.status = req.query.status;
            }
            // If status is empty string (all statuses selected), don't filter by status
        } else if (!isAdmin) {
            // For non-admin users, only show ACTIVE products by default
            filter.status = 'ACTIVE';
        }

        // Keyword search on name/description (case/diacritic insensitive via collation)
        if (searchTerm) {
            const keyword = searchTerm.trim();
            filter.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { tags: { $in: [new RegExp(keyword, 'i')] } }
            ];
        }

        // Category filter
        if (categoryId) {
            filter.categoryId = categoryId;
        }

        // Price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Stock filter
        if (typeof inStock !== 'undefined') {
            if (inStock === 'true') {
                filter.stock = { $gt: 0 };
            } else if (inStock === 'false') {
                filter.stock = { $lte: 0 };
            }
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
        const skip = (pageNum - 1) * pageSize;

        // Sorting
        let sortOption = { createdAt: -1 };
        if (sort) {
            const [field, direction] = String(sort).split(':');
            if (field) {
                sortOption = { [field]: direction === 'asc' ? 1 : -1 };
            }
        }

        const query = Product.find(filter)
            .collation({ locale: 'vi', strength: 1 })
            .sort(sortOption)
            .skip(skip)
            .limit(pageSize);

        const [items, total] = await Promise.all([
            query.exec(),
            Product.countDocuments(filter)
        ]);

        if (total === 0) {
            return res.status(200).json({
                message: 'Không tìm thấy sản phẩm',
                items: [],
                pagination: { total: 0, page: pageNum, pages: 0, limit: pageSize }
            });
        }

        return res.status(200).json({
            items,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / pageSize),
                limit: pageSize
            }
        });
    } catch (error) {
        return next(error);
    }
};
