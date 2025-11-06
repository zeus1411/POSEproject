import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../utils/errorHandler.js';

// Helper function to calculate cart summary
const calculateCartSummary = (items) => {
  let totalItems = 0;
  let subtotal = 0;
  
  items.forEach(item => {
    if (item.productId) {
      const price = item.productId.salePrice || item.productId.price;
      const discount = item.productId.discount || 0;
      const itemTotal = price * item.quantity * (1 - discount / 100);
      totalItems += item.quantity;
      subtotal += itemTotal;
    }
  });
  
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  
  return {
    totalItems,
    subtotal,
    shippingFee,
    total: subtotal + shippingFee
  };
};

// @desc    Lấy giỏ hàng của user
// @route   GET /api/v1/cart
// @access  Private
export const getCart = async (req, res) => {
  const userId = req.user.userId;
  
  let cart = await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    select: 'name price salePrice discount images stock sku status'
  });
  
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  
  // Filter out inactive products
  cart.items = cart.items.filter(item => 
    item.productId && item.productId.status === 'ACTIVE'
  );
  
  const summary = calculateCartSummary(cart.items);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { cart, summary }
  });
};

// @desc    Lấy chỉ summary của giỏ hàng (OPTIMIZED - không trả về full items)
// @route   GET /api/v1/cart/summary
// @access  Private
export const getCartSummary = async (req, res) => {
  const userId = req.user.userId;
  
  const cart = await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    select: 'price salePrice discount'
  });
  
  if (!cart) {
    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        summary: {
          totalItems: 0,
          subtotal: 0,
          shippingFee: 0,
          total: 0
        }
      }
    });
  }
  
  const summary = calculateCartSummary(cart.items);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { summary }
  });
};

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/v1/cart/items
// @access  Private
export const addToCart = async (req, res) => {
  const userId = req.user.userId;
  const { productId, quantity = 1 } = req.body;
  
  if (!productId) {
    throw new BadRequestError('Product ID is required');
  }
  
  if (quantity < 1) {
    throw new BadRequestError('Quantity must be at least 1');
  }
  
  // Check if product exists and is active
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new NotFoundError('Không tìm thấy sản phẩm');
  }
  
  if (product.status !== 'ACTIVE') {
    throw new BadRequestError('Sản phẩm hiện không khả dụng');
  }
  
  if (product.stock < quantity) {
    throw new BadRequestError(`Chỉ còn ${product.stock} sản phẩm trong kho`);
  }
  
  // Find or create cart
  let cart = await Cart.findOne({ userId });
  
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }
  
  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );
  
  if (existingItemIndex > -1) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    
    if (newQuantity > product.stock) {
      throw new BadRequestError(`Chỉ có thể thêm tối đa ${product.stock} sản phẩm`);
    }
    
    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item
    cart.items.push({ productId, quantity });
  }
  
  await cart.save();
  
  // Populate cart for response
  cart = await Cart.findById(cart._id).populate({
    path: 'items.productId',
    select: 'name price salePrice discount images stock sku status'
  });
  
  const summary = calculateCartSummary(cart.items);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã thêm sản phẩm vào giỏ hàng',
    data: { cart, summary }
  });
};

// @desc    Cập nhật số lượng sản phẩm trong giỏ hàng (OPTIMIZED)
// @route   PATCH /api/v1/cart/items/:productId
// @access  Private
export const updateCartItem = async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.params;
  const { quantity } = req.body;
  
  if (quantity < 1) {
    throw new BadRequestError('Số lượng phải lớn hơn 0');
  }
  
  const cart = await Cart.findOne({ userId });
  
  if (!cart) {
    throw new NotFoundError('Không tìm thấy giỏ hàng');
  }
  
  const itemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );
  
  if (itemIndex === -1) {
    throw new NotFoundError('Sản phẩm không có trong giỏ hàng');
  }
  
  // Check product stock
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new NotFoundError('Không tìm thấy sản phẩm');
  }
  
  if (quantity > product.stock) {
    throw new BadRequestError(`Chỉ còn ${product.stock} sản phẩm trong kho`);
  }
  
  // Update quantity
  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  
  // OPTIMIZED: Only populate necessary fields for response
  const updatedCart = await Cart.findById(cart._id).populate({
    path: 'items.productId',
    select: 'name price salePrice discount images stock sku status'
  });
  
  const summary = calculateCartSummary(updatedCart.items);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { cart: updatedCart, summary }
  });
};

// @desc    Xóa sản phẩm khỏi giỏ hàng
// @route   DELETE /api/v1/cart/items/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.params;
  
  const cart = await Cart.findOne({ userId });
  
  if (!cart) {
    throw new NotFoundError('Không tìm thấy giỏ hàng');
  }
  
  cart.items = cart.items.filter(
    item => item.productId.toString() !== productId
  );
  
  await cart.save();
  
  // Populate for response
  const updatedCart = await Cart.findById(cart._id).populate({
    path: 'items.productId',
    select: 'name price salePrice discount images stock sku status'
  });
  
  const summary = calculateCartSummary(updatedCart.items);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã xóa sản phẩm khỏi giỏ hàng',
    data: { cart: updatedCart, summary }
  });
};

// @desc    Xóa toàn bộ giỏ hàng
// @route   DELETE /api/v1/cart
// @access  Private
export const clearCart = async (req, res) => {
  const userId = req.user.userId;
  
  const cart = await Cart.findOne({ userId });
  
  if (!cart) {
    throw new NotFoundError('Không tìm thấy giỏ hàng');
  }
  
  cart.items = [];
  await cart.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã xóa toàn bộ giỏ hàng',
    data: {
      cart,
      summary: {
        totalItems: 0,
        subtotal: 0,
        shippingFee: 0,
        total: 0
      }
    }
  });
};

// @desc    Validate giỏ hàng trước khi checkout
// @route   POST /api/v1/cart/validate
// @access  Private
export const validateCart = async (req, res) => {
  const userId = req.user.userId;
  
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
  
  const summary = calculateCartSummary(validItems);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      isValid: errors.length === 0,
      errors,
      validItems,
      summary
    }
  });
};

export default {
  getCart,
  getCartSummary,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart
};