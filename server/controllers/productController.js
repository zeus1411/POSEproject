import Product from '../models/productModel.js';

// Create a new product
export const createProduct = async (req, res, next) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        next(error);
    }
};

// Get all products
export const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

// Get product by ID
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

// Update product by ID
export const updateProduct = async (req, res, next) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        next(error);
    }
};

// Delete product by ID
export const deleteProduct = async (req, res, next) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Search & Filter products with pagination
export const searchProducts = async (req, res, next) => {
    try {
        const {
            q, // keyword
            categoryId,
            minPrice,
            maxPrice,
            inStock, // 'true' | 'false'
            page = 1,
            limit = 12,
            sort // e.g. 'price:asc', 'createdAt:desc'
        } = req.query;

        // Validate keyword input edge cases
        if (typeof q === 'string') {
            const trimmed = q.trim();
            if (trimmed.length === 0) {
                return res.status(400).json({ message: 'Vui lòng nhập từ khóa tìm kiếm' });
            }
        }

        const filter = {};

        // Keyword search on name/description (case/diacritic insensitive via collation)
        if (q) {
            const keyword = q.trim();
            filter.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
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
        // Database connectivity or other errors
        return res.status(503).json({ message: 'Tạm thời không thể tìm kiếm, vui lòng thử lại sau' });
    }
};
