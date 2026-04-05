import api from './api';

// Lấy giỏ hàng của user hiện tại
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

// Lấy chỉ summary (không lấy full cart items) - OPTIMIZED
export const getCartSummary = async () => {
  const response = await api.get('/cart/summary');
  return response.data;
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (productId, quantity = 1, variantId = null) => {
  const response = await api.post('/cart/items', { productId, quantity, variantId });
  return response.data;
};

// Cập nhật số lượng sản phẩm trong giỏ
export const updateCartItem = async (productId, quantity, variantId = null) => {
  const response = await api.patch(`/cart/items/${productId}`, { quantity, variantId });
  return response.data;
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (productId, variantId = null) => {
  const url = variantId 
    ? `/cart/items/${productId}?variantId=${variantId}`
    : `/cart/items/${productId}`;
  const response = await api.delete(url);
  return response.data;
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

// Kiểm tra giỏ hàng trước khi thanh toán
export const validateCart = async () => {
  const response = await api.post('/cart/validate');
  return response.data;
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