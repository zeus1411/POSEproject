import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Create a new product
export const createProduct = async (req, res, next) => {
    try {
        // sellerId is required in schema -> get from token (admin created)
        const payload = {
            ...req.body,
            sellerId: req.user?.userId, // already authenticated + authorized as admin
        };
        const product = new Product(payload);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
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
        const isValidId = mongoose.Types.ObjectId.isValid(id);
        if (!isValidId) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }
        const isAdmin = req.user?.role === 'admin';
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // User can only view ACTIVE products
        if (!isAdmin && product.status !== 'ACTIVE') {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Lazy update viewCount - don't block the response
        Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).catch(() => { });
        res.status(200).json(product);
    } catch (error) {
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
        next(error);
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

        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json({ message: 'Xóa sản phẩm thành công' });
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
        if (!isAdmin || !includeInactive) {
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
