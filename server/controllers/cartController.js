import cartService from '../services/cartService.js';
import { StatusCodes } from 'http-status-codes';

export const getCart = async (req, res) => {
  const userId = req.user.userId;
  
  const result = await cartService.getCart(userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: result
  });
};

export const getCartSummary = async (req, res) => {
  const userId = req.user.userId;
  
  const result = await cartService.getCartSummary(userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: result
  });
};

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

export const clearCart = async (req, res) => {
  const userId = req.user.userId;
  
  const result = await cartService.clearCart(userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã xóa toàn bộ giỏ hàng',
    data: result
  });
};

export const validateCart = async (req, res) => {
  const userId = req.user.userId;
  
  const result = await cartService.validateCart(userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: result
  });
};