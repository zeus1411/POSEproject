import cartService from '../services/cartService.js';
import { StatusCodes } from 'http-status-codes';

// @desc    Lấy giỏ hàng của user
// @route   GET /api/v1/cart
// @access  Private
export const getCart = async (req, res) => {
  const userId = req.user.userId;
  
  const result = await cartService.getCart(userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: result
  });
};

// @desc    Lấy chỉ summary của giỏ hàng (OPTIMIZED - không trả về full items)
// @route   GET /api/v1/cart/summary
// @access  Private
export const getCartSummary = async (req, res) => {
  const userId = req.user.userId;
  
  const result = await cartService.getCartSummary(userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: result
  });
};

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/v1/cart/items
// @access  Private
export const addToCart = async (req, res) => {
  const userId = req.user.userId;
  const { productId, quantity = 1, variantId } = req.body;
  
  const result = await cartService.addToCart(userId, { productId, quantity, variantId });
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã thêm sản phẩm vào giỏ hàng',
    data: result
  });
};

// @desc    Cập nhật số lượng sản phẩm trong giỏ hàng (OPTIMIZED)
// @route   PATCH /api/v1/cart/items/:productId
// @access  Private
export const updateCartItem = async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.params;
  const { quantity, variantId } = req.body;
  
  const result = await cartService.updateCartItem(userId, productId, { quantity, variantId });
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: result
  });
};

// @desc    Xóa sản phẩm khỏi giỏ hàng
// @route   DELETE /api/v1/cart/items/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.params;
  const { variantId } = req.query;
  
  const result = await cartService.removeFromCart(userId, productId, variantId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã xóa sản phẩm khỏi giỏ hàng',
    data: result
  });
};

// @desc    Xóa toàn bộ giỏ hàng
// @route   DELETE /api/v1/cart
// @access  Private
export const clearCart = async (req, res) => {
  const userId = req.user.userId;
  
  const result = await cartService.clearCart(userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã xóa toàn bộ giỏ hàng',
    data: result
  });
};

// @desc    Validate giỏ hàng trước khi checkout
// @route   POST /api/v1/cart/validate
// @access  Private
export const validateCart = async (req, res) => {
  const userId = req.user.userId;
  
  const result = await cartService.validateCart(userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: result
  });
};