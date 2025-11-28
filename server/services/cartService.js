import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { BadRequestError, NotFoundError } from '../utils/errorHandler.js';

/**
 * Cart Service
 * Contains all business logic for cart operations
 */

class CartService {
  /**
   * Calculate cart summary
   * @param {Array} items - Cart items
   * @returns {Object} Cart summary
   */
  calculateCartSummary(items) {
    let totalItems = 0;
    let subtotal = 0;
    
    items.forEach(item => {
      if (item.productId) {
        let price = item.productId.salePrice || item.productId.price;
        
        if (item.selectedVariant && item.selectedVariant.price) {
          price = item.selectedVariant.price;
        } else if (item.productId.hasVariants && item.variantId) {
          const variant = item.productId.variants?.find(v => v._id.toString() === item.variantId);
          if (variant) {
            price = variant.price;
          }
        }
        
        const discount = item.productId.discount || 0;
        const itemTotal = price * item.quantity * (1 - discount / 100);
        totalItems += item.quantity;
        subtotal += itemTotal;
      }
    });
    
    // Shipping fee = 14% of subtotal (rounded)
    const shippingFee = Math.round(subtotal * 0.14);
    
    return {
      totalItems,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee
    };
  }

  /**
   * Get user's cart
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Cart with summary
   */
  async getCart(userId) {
    let cart = await Cart.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, items: [] } },
      { upsert: true, new: true }
    ).populate({
      path: 'items.productId',
      select: 'name price salePrice discount images stock sku status hasVariants variants options'
    });
    
    // Filter out inactive products
    cart.items = cart.items.filter(item => 
      item.productId && item.productId.status === 'ACTIVE'
    );
    
    const summary = this.calculateCartSummary(cart.items);
    
    return { cart, summary };
  }

  /**
   * Get cart summary only
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Cart summary
   */
  async getCartSummary(userId) {
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'price salePrice discount'
    });
    
    if (!cart) {
      return {
        summary: {
          totalItems: 0,
          subtotal: 0,
          shippingFee: 0,
          total: 0
        }
      };
    }
    
    const summary = this.calculateCartSummary(cart.items);
    return { summary };
  }

  /**
   * Add product to cart
   * @param {string} userId - User ID
   * @param {Object} itemData - Item data { productId, quantity, variantId }
   * @returns {Promise<Object>} Updated cart with summary
   */
  async addToCart(userId, itemData) {
    const { productId, quantity = 1, variantId } = itemData;
    
    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }
    
    if (quantity < 1) {
      throw new BadRequestError('Quantity must be at least 1');
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new NotFoundError('Không tìm thấy sản phẩm');
    }
    
    if (product.status !== 'ACTIVE') {
      throw new BadRequestError('Sản phẩm hiện không khả dụng');
    }
    
    // Handle variant products
    let selectedVariant = null;
    let availableStock = product.stock;
    
    if (product.hasVariants) {
      if (!variantId) {
        throw new BadRequestError('Vui lòng chọn biến thể sản phẩm');
      }
      
      selectedVariant = product.variants.find(v => v._id.toString() === variantId);
      if (!selectedVariant) {
        throw new BadRequestError('Biến thể sản phẩm không tồn tại');
      }
      
      if (!selectedVariant.isActive) {
        throw new BadRequestError('Biến thể sản phẩm không khả dụng');
      }
      
      availableStock = selectedVariant.stock;
    }
    
    if (availableStock < quantity) {
      throw new BadRequestError(`Chỉ còn ${availableStock} sản phẩm trong kho`);
    }
    
    let cart = await Cart.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, items: [] } },
      { upsert: true, new: true }
    );
    
    const existingItemIndex = cart.items.findIndex(item => {
      const sameProduct = item.productId.toString() === productId;
      const sameVariant = product.hasVariants 
        ? item.variantId === variantId 
        : true;
      return sameProduct && sameVariant;
    });
    
    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > availableStock) {
        throw new BadRequestError(`Chỉ có thể thêm tối đa ${availableStock} sản phẩm`);
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      const newItem = {
        productId,
        quantity
      };
      
      if (product.hasVariants && selectedVariant) {
        newItem.variantId = variantId;
        newItem.selectedVariant = {
          optionValues: selectedVariant.optionValues,
          price: selectedVariant.price,
          stock: selectedVariant.stock
        };
      }
      
      cart.items.push(newItem);
    }
    
    await cart.save();
    
    cart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price salePrice discount images stock sku status hasVariants variants options'
    });
    
    const summary = this.calculateCartSummary(cart.items);
    
    return { cart, summary };
  }

  /**
   * Update cart item quantity
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {Object} updateData - { quantity, variantId }
   * @returns {Promise<Object>} Updated cart with summary
   */
  async updateCartItem(userId, productId, updateData) {
    const { quantity, variantId } = updateData;
    
    if (quantity < 1) {
      throw new BadRequestError('Số lượng phải lớn hơn 0');
    }
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      throw new NotFoundError('Không tìm thấy giỏ hàng');
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new NotFoundError('Không tìm thấy sản phẩm');
    }
    
    const itemIndex = cart.items.findIndex(item => {
      const sameProduct = item.productId.toString() === productId;
      const sameVariant = product.hasVariants 
        ? item.variantId === variantId 
        : true;
      return sameProduct && sameVariant;
    });
    
    if (itemIndex === -1) {
      throw new NotFoundError('Sản phẩm không có trong giỏ hàng');
    }
    
    let availableStock = product.stock;
    if (product.hasVariants && variantId) {
      const variant = product.variants.find(v => v._id.toString() === variantId);
      if (!variant) {
        throw new BadRequestError('Biến thể sản phẩm không tồn tại');
      }
      availableStock = variant.stock;
    }
    
    if (quantity > availableStock) {
      throw new BadRequestError(`Chỉ còn ${availableStock} sản phẩm trong kho`);
    }
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price salePrice discount images stock sku status hasVariants variants options'
    });
    
    const summary = this.calculateCartSummary(updatedCart.items);
    
    return { cart: updatedCart, summary };
  }

  /**
   * Remove item from cart
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID (optional)
   * @returns {Promise<Object>} Updated cart with summary
   */
  async removeFromCart(userId, productId, variantId = null) {
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      throw new NotFoundError('Không tìm thấy giỏ hàng');
    }
    
    cart.items = cart.items.filter(item => {
      const sameProduct = item.productId.toString() === productId;
      if (!sameProduct) return true;
      
      if (variantId) {
        return item.variantId !== variantId;
      }
      
      return false;
    });
    
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price salePrice discount images stock sku status hasVariants variants options'
    });
    
    const summary = this.calculateCartSummary(updatedCart.items);
    
    return { cart: updatedCart, summary };
  }

  /**
   * Clear entire cart
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Empty cart with summary
   */
  async clearCart(userId) {
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      throw new NotFoundError('Không tìm thấy giỏ hàng');
    }
    
    cart.items = [];
    await cart.save();
    
    return {
      cart,
      summary: {
        totalItems: 0,
        subtotal: 0,
        shippingFee: 0,
        total: 0
      }
    };
  }

  /**
   * Validate cart before checkout
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Validation result
   */
  async validateCart(userId) {
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name price salePrice discount stock status'
    });
    
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Giỏ hàng trống');
    }
    
    const errors = [];
    const validItems = [];
    
    for (const item of cart.items) {
      const product = item.productId;
      
      if (!product) {
        errors.push({
          item: item._id,
          message: 'Sản phẩm không tồn tại'
        });
        continue;
      }
      
      if (product.status !== 'ACTIVE') {
        errors.push({
          productId: product._id,
          productName: product.name,
          message: 'Sản phẩm hiện không khả dụng'
        });
        continue;
      }
      
      if (product.stock < item.quantity) {
        errors.push({
          productId: product._id,
          productName: product.name,
          message: `Chỉ còn ${product.stock} sản phẩm trong kho`,
          requestedQuantity: item.quantity,
          availableStock: product.stock
        });
        continue;
      }
      
      validItems.push(item);
    }
    
    const summary = this.calculateCartSummary(validItems);
    
    return {
      isValid: errors.length === 0,
      errors,
      validItems,
      summary
    };
  }
}

// Export singleton instance
export default new CartService();
