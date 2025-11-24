import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../utils/errorHandler.js';
import { deleteFromCloudinary } from '../utils/cloudinaryUtils.js';

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

    console.log('🔍 getProductById called:', { id, isAdmin, includeInactive });

    const product = await Product.findById(id).populate('categoryId', 'name _id');
    
    if (!product) {
      console.log('❌ Product not found in database');
      throw new NotFoundError('Product not found');
    }

    console.log('📦 Product found:', { 
      id: product._id, 
      name: product.name, 
      status: product.status,
      hasVariants: product.hasVariants 
    });

    // Admin với includeInactive=true có thể xem mọi sản phẩm
    // User thường chỉ xem được sản phẩm ACTIVE
    if (!isAdmin && product.status !== 'ACTIVE') {
      console.log('❌ Non-admin trying to access inactive product');
      throw new NotFoundError('Product not found');
    }
    
    // Admin không có includeInactive vẫn bị chặn xem inactive products
    if (isAdmin && !includeInactive && product.status !== 'ACTIVE') {
      console.log('❌ Admin without includeInactive trying to access inactive product');
      throw new NotFoundError('Product not found');
    }

    console.log('✅ Product access allowed');

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
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } }
      ];
    }

    // Category filter
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Stock filter
    if (typeof inStock !== 'undefined') {
      if (inStock === 'true') {
        query.stock = { $gt: 0 };
      } else if (inStock === 'false') {
        query.stock = { $lte: 0 };
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
   * Update product variants and options
   * @param {string} id - Product ID
   * @param {Object} variantsData - Variants data
   * @returns {Promise<Object>} Updated product
   */
  async updateProductVariants(id, variantsData) {
    const { hasVariants, options, variants } = variantsData;

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    // Validate options structure
    if (hasVariants && options) {
      for (const option of options) {
        if (!option.name || !option.values || option.values.length === 0) {
          throw new BadRequestError('Mỗi option phải có tên và ít nhất 1 giá trị');
        }
      }
    }

    product.hasVariants = hasVariants;
    product.options = hasVariants ? options : [];
    
    // Xử lý variants: update nếu có _id, thêm mới nếu không
    if (hasVariants && variants && variants.length > 0) {
      const updatedVariants = [];
      
      for (const variantData of variants) {
        if (variantData._id) {
          // Variant có _id -> UPDATE
          const existingIndex = product.variants.findIndex(
            v => v._id.toString() === variantData._id.toString()
          );
          
          if (existingIndex !== -1) {
            // Merge data, giữ _id
            product.variants[existingIndex] = {
              ...product.variants[existingIndex].toObject(),
              ...variantData,
              _id: product.variants[existingIndex]._id
            };
            updatedVariants.push(product.variants[existingIndex]);
          } else {
            // _id không tồn tại -> thêm mới
            updatedVariants.push(variantData);
          }
        } else {
          // Không có _id -> Variant MỚI
          updatedVariants.push(variantData);
        }
      }
      
      product.variants = updatedVariants;
    } else {
      product.variants = [];
    }

    await product.save();
    return product;
  }

  /**
   * Add a single variant to product
   * @param {string} id - Product ID
   * @param {Object} variantData - Variant data
   * @returns {Promise<Object>} Updated product
   */
  async addVariant(id, variantData) {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    if (!product.hasVariants) {
      throw new BadRequestError('Sản phẩm chưa được cấu hình để có variants');
    }

    const skuExists = product.variants.some(v => v.sku === variantData.sku);
    if (skuExists) {
      throw new BadRequestError('SKU đã tồn tại trong danh sách variants');
    }

    product.variants.push(variantData);
    await product.save();

    return product;
  }

  /**
   * Update a specific variant
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated product
   */
  async updateVariant(productId, variantId, updateData) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    const variantIndex = product.variants.findIndex(
      v => v._id.toString() === variantId
    );

    if (variantIndex === -1) {
      throw new NotFoundError('Không tìm thấy variant');
    }

    product.variants[variantIndex] = {
      ...product.variants[variantIndex].toObject(),
      ...updateData,
      _id: product.variants[variantIndex]._id
    };

    await product.save();
    return product;
  }

  /**
   * Delete a specific variant
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID
   * @returns {Promise<Object>} Updated product
   */
  async deleteVariant(productId, variantId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    product.variants = product.variants.filter(
      v => v._id.toString() !== variantId
    );

    await product.save();
    return product;
  }
}

// Export singleton instance
export default new ProductService();
