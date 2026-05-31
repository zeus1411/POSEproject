import Product from '../models/Product.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../../utils/errorHandler.js';
import { deleteFromCloudinary } from '../../utils/cloudinaryUtils.js';
import cacheService from './cacheService.js';

/**
 * Product Service
 * Contains all business logic for product operations
 */

class ProductService {
  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @param {Array} uploadedFiles - Uploaded image files
   * @param {string} sellerId - User ID of the seller
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData, uploadedFiles = [], sellerId = null) {
    // Handle uploaded images
    if (uploadedFiles && uploadedFiles.length > 0) {
      productData.images = uploadedFiles.map(file => file.path);
    } else if (productData.images && !Array.isArray(productData.images)) {
      productData.images = [];
    }

    // Parse variants data if present
    if (productData.hasVariants === 'true' || productData.hasVariants === true) {
      productData.hasVariants = true;
      
      if (productData.options && typeof productData.options === 'string') {
        try {
          productData.options = JSON.parse(productData.options);
        } catch (err) {
          console.error('Error parsing options:', err);
          productData.options = [];
        }
      }
      
      if (productData.variants && typeof productData.variants === 'string') {
        try {
          productData.variants = JSON.parse(productData.variants);
        } catch (err) {
          console.error('Error parsing variants:', err);
          productData.variants = [];
        }
      }
      
      // ✅ Khi có variants, xóa price và stock khỏi productData để tránh validation error
      delete productData.price;
      delete productData.stock;
    } else {
      productData.hasVariants = false;
      productData.options = [];
      productData.variants = [];
    }

    // Add sellerId to product data
    const payload = {
      ...productData,
      sellerId: sellerId
    };

    const product = new Product(payload);
    await product.validate(); // ép chạy validation rõ ràng hơn
    return await product.save();
  }

  /**
   * Get all products with optional filters
   * @param {boolean} isAdmin - Is user admin
   * @param {boolean} includeInactive - Include inactive products
   * @returns {Promise<Array>} Array of products
   */
  async getAllProducts(isAdmin = false, includeInactive = false) {
    const filter = {};
    if (!isAdmin || !includeInactive) {
      filter.status = 'ACTIVE';
    }
    
    return await Product.find(filter).sort({ createdAt: -1 });
  }

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @param {boolean} isAdmin - Is user admin
   * @param {boolean} includeInactive - Include inactive products
   * @returns {Promise<Object>} Product object
   */
  async getProductById(id, isAdmin = false, includeInactive = false) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    // Thử lấy từ cache trước (chỉ cache cho user, không cache admin view)
    if (!isAdmin && !includeInactive) {
      const cachedProduct = await cacheService.getProduct(id);
      if (cachedProduct) {
        // Lazy update viewCount
        Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).catch(() => {});
        return cachedProduct;
      }
    }

    const product = await Product.findById(id).populate('categoryId', 'name _id');
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Admin với includeInactive=true có thể xem mọi sản phẩm
    // User thường chỉ xem được sản phẩm ACTIVE
    if (!isAdmin && product.status !== 'ACTIVE') {
      throw new NotFoundError('Product not found');
    }
    
    // Admin không có includeInactive vẫn bị chặn xem inactive products
    if (isAdmin && !includeInactive && product.status !== 'ACTIVE') {
      throw new NotFoundError('Product not found');
    }

    // Lưu vào cache (chỉ cache cho user view, TTL 10 phút)
    if (!isAdmin && !includeInactive && product.status === 'ACTIVE') {
      await cacheService.setProduct(id, product, 600);
    }

    // Lazy update viewCount
    Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).catch(() => {});
    
    return product;
  }

  /**
   * Update product by ID
   * @param {string} id - Product ID
   * @param {Object} updateData - Update data
   * @param {Array} uploadedFiles - Newly uploaded files
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(id, updateData, uploadedFiles = []) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    // Xóa cache của sản phẩm này
    await cacheService.invalidateProduct(id);

    // Handle images update
    let finalImages = [];
    
    // Add existing images that weren't deleted
    if (updateData.existingImages) {
      try {
        const existingImages = JSON.parse(updateData.existingImages);
        if (Array.isArray(existingImages)) {
          finalImages = [...existingImages];
        }
      } catch (err) {
        console.error('Error parsing existingImages:', err);
      }
    }
    
    // Add newly uploaded images
    if (uploadedFiles && uploadedFiles.length > 0) {
      const newImageUrls = uploadedFiles.map(file => file.path);
      finalImages = [...finalImages, ...newImageUrls];
    }
    
    if (finalImages.length > 0) {
      updateData.images = finalImages;
    }

    // Parse variants data if present
    if (updateData.hasVariants === 'true' || updateData.hasVariants === true) {
      updateData.hasVariants = true;
      
      if (updateData.options && typeof updateData.options === 'string') {
        try {
          updateData.options = JSON.parse(updateData.options);
        } catch (err) {
          console.error('Error parsing options:', err);
          updateData.options = [];
        }
      }
      
      if (updateData.variants && typeof updateData.variants === 'string') {
        try {
          updateData.variants = JSON.parse(updateData.variants);
        } catch (err) {
          console.error('Error parsing variants:', err);
          updateData.variants = [];
        }
      }
      
      // ✅ Khi có variants, xóa price và stock khỏi updateData để tránh validation error
      delete updateData.price;
      delete updateData.stock;
    } else if (updateData.hasVariants === 'false' || updateData.hasVariants === false) {
      updateData.hasVariants = false;
      updateData.options = [];
      updateData.variants = [];
    }

    // Remove existingImages from body (not a model field)
    delete updateData.existingImages;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return updatedProduct;
  }

  /**
   * Update product images
   * @param {string} id - Product ID
   * @param {Array} imageUrls - Array of image URLs
   * @returns {Promise<Object>} Updated product
   */
  async updateProductImages(id, imageUrls) {
    if (!imageUrls || !Array.isArray(imageUrls)) {
      throw new BadRequestError('Danh sách ảnh không hợp lệ');
    }

    if (!imageUrls.every(url => typeof url === 'string' && url.trim().length > 0)) {
      throw new BadRequestError('Mỗi URL ảnh phải là một chuỗi không rỗng');
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { images: imageUrls } },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    return product;
  }

  /**
   * Delete product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Result message
   */
  async deleteProduct(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID không hợp lệ');
    }

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    await Product.findByIdAndDelete(id);
    
    // Xóa cache của sản phẩm này
    await cacheService.invalidateProduct(id);
    
    return { success: true, message: 'Xóa sản phẩm thành công' };
  }

  /**
   * Search and filter products with pagination
   * @param {Object} filters - Search filters
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Products with pagination
   */
  async searchProducts(filters, user = null) {
    const {
      q,
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      minRating,
      maxRating,
      page = 1,
      limit = 12,
      sort,
      status
    } = filters;

    const searchTerm = search || q;

    if (searchTerm && typeof searchTerm === 'string') {
      const trimmed = searchTerm.trim();
      if (trimmed.length === 0) {
        throw new BadRequestError('Vui lòng nhập từ khóa tìm kiếm');
      }
    }

    const query = {};
    const andConditions = []; // Dùng để kết hợp nhiều điều kiện $or
    const isAdmin = user?.role === 'admin';
    const includeInactive = filters.includeInactive === 'true';
    
    if (status !== undefined) {
      if (status) {
        query.status = status;
      }
    } else if (!isAdmin) {
      query.status = 'ACTIVE';
    }

    // Keyword search
    if (searchTerm) {
      const keyword = searchTerm.trim();
      andConditions.push({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(keyword, 'i')] } }
        ]
      });
    }

    // Category filter
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Price range
    if (minPrice !== undefined && minPrice !== null && minPrice !== '' || maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      query.price = {};
      if (minPrice !== undefined && minPrice !== null && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating !== undefined && minRating !== null && minRating !== '') {
      const ratingValue = Number(minRating);
      if (!Number.isNaN(ratingValue)) {
        query['rating.average'] = {
          ...(query['rating.average'] || {}),
          $gte: ratingValue
        };
      }
    }

    if (maxRating !== undefined && maxRating !== null && maxRating !== '') {
      const ratingValue = Number(maxRating);
      if (!Number.isNaN(ratingValue)) {
        query['rating.average'] = {
          ...(query['rating.average'] || {}),
          $lte: ratingValue
        };
      }
    }

    // Stock filter
    if (typeof inStock !== 'undefined') {
      if (inStock === 'true') {
        // Còn hàng
        andConditions.push({
          $or: [
            // Case 1: Sản phẩm KHÔNG có variant (hasVariants != true) và stock > 0
            { 
              hasVariants: { $ne: true },
              stock: { $gt: 0 }
            },
            // Case 2: Sản phẩm CÓ variant và có ít nhất 1 variant còn hàng
            { 
              hasVariants: true,
              variants: {
                $elemMatch: {
                  stock: { $gt: 0 },
                  isActive: true
                }
              }
            }
          ]
        });
      } else if (inStock === 'false') {
        // Hết hàng
        andConditions.push({
          $or: [
            // Case 1: Sản phẩm KHÔNG có variant (hasVariants != true) và stock <= 0
            { 
              hasVariants: { $ne: true },
              stock: { $lte: 0 }
            },
            // Case 2: Sản phẩm CÓ variant nhưng TẤT CẢ variants đều hết hàng hoặc inactive
            { 
              hasVariants: true,
              $nor: [{
                variants: {
                  $elemMatch: {
                    stock: { $gt: 0 },
                    isActive: true
                  }
                }
              }]
            }
          ]
        });
      }
    }

    // Kết hợp tất cả điều kiện $or vào $and nếu có
    if (andConditions.length > 0) {
      query.$and = andConditions;
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

    const productQuery = Product.find(query)
      .collation({ locale: 'vi', strength: 1 })
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    const [items, total] = await Promise.all([
      productQuery.exec(),
      Product.countDocuments(query)
    ]);

    return {
      items,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / pageSize),
        limit: pageSize
      },
      message: total === 0 ? 'Không tìm thấy sản phẩm' : null
    };
  }

  /**
   * Build lightweight purchase-based recommendations for a signed-in customer.
   * This uses existing order/category data and deliberately excludes products
   * already purchased by the customer.
   */
  async getPersonalizedRecommendations(userId, limit = 6) {
    const itemLimit = Math.max(1, Math.min(12, Number(limit) || 6));
    const orders = await Order.find({
      userId,
      status: { $nin: ['CANCELLED', 'FAILED'] }
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('items.productId createdAt')
      .populate('items.productId', 'name categoryId');

    const purchasedProducts = orders.flatMap((order) => (
      order.items
        .map((item) => item.productId)
        .filter(Boolean)
    ));

    if (purchasedProducts.length === 0) {
      return {
        hasPurchaseHistory: false,
        basis: 'none',
        recommended: [],
        similar: []
      };
    }

    const purchasedIds = [...new Set(purchasedProducts.map((product) => product._id.toString()))];
    const categoryWeights = new Map();

    orders.forEach((order, orderIndex) => {
      const recencyWeight = orderIndex === 0 ? 3 : orderIndex < 4 ? 2 : 1;
      order.items.forEach((item) => {
        const categoryId = item.productId?.categoryId?.toString();
        if (categoryId) {
          categoryWeights.set(categoryId, (categoryWeights.get(categoryId) || 0) + recencyWeight);
        }
      });
    });

    const categoryIds = [...categoryWeights.keys()];
    const latestCategoryIds = [
      ...new Set((orders[0]?.items || [])
        .map((item) => item.productId?.categoryId?.toString())
        .filter(Boolean))
    ];

    if (categoryIds.length === 0) {
      return {
        hasPurchaseHistory: true,
        basis: 'purchase-history-without-categories',
        recommended: [],
        similar: []
      };
    }

    const candidates = await Product.find({
      status: 'ACTIVE',
      categoryId: { $in: categoryIds },
      _id: { $nin: purchasedIds }
    })
      .populate('categoryId', 'name slug')
      .limit(100)
      .lean();

    const recommendationScore = (product) => {
      const categoryScore = categoryWeights.get(product.categoryId?._id?.toString() || product.categoryId?.toString()) || 0;
      return categoryScore * 100
        + (product.isFeatured ? 20 : 0)
        + (product.rating?.average || 0) * 5
        + Math.min(product.soldCount || 0, 100) / 10;
    };

    const similarityScore = (product) => (
      (product.rating?.average || 0) * 10
      + Math.min(product.soldCount || 0, 100)
      + (product.isFeatured ? 10 : 0)
    );

    const recommended = [...candidates]
      .sort((left, right) => recommendationScore(right) - recommendationScore(left))
      .slice(0, itemLimit);

    const similar = candidates
      .filter((product) => latestCategoryIds.includes(product.categoryId?._id?.toString() || product.categoryId?.toString()))
      .sort((left, right) => similarityScore(right) - similarityScore(left))
      .slice(0, itemLimit);

    return {
      hasPurchaseHistory: true,
      basis: 'purchased-categories',
      sourceProducts: purchasedProducts.slice(0, 4).map((product) => product.name),
      recommended,
      similar
    };
  }

  /**
   * Quick search for products by name or SKU
   * Specifically for blog tagging or similar quick selections
   * @param {string} searchTerm - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>} List of products
   */
  async searchProductsQuick(searchTerm, limit = 10) {
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
      return [];
    }

    const keyword = searchTerm.trim();
    const query = {
      status: 'ACTIVE',
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { sku: { $regex: keyword, $options: 'i' } }
      ]
    };

    return await Product.find(query)
      .select('name price images sku slug discount originalPrice')
      .limit(limit)
      .sort({ name: 1 });
  }

}

// Export singleton instance
export default new ProductService();

