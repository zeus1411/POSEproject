import api from './api';

// Kiểm tra trạng thái review cho order
export const checkOrderReviewStatus = async (orderId) => {
  const response = await api.get(`/reviews/check-order-status/${orderId}`);
  return response.data;
};

// Kiểm tra xem user đã review sản phẩm chưa
export const checkReviewStatus = async (productId) => {
  const response = await api.get(`/reviews/check-status/${productId}`);
  return response.data;
};

// Tạo review mới
export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

// Lấy reviews của sản phẩm
export const getProductReviews = async (productId, params = {}) => {
  const response = await api.get(`/reviews/${productId}`, { params });
  return response.data;
};

export default {
  checkOrderReviewStatus,
  checkReviewStatus,
  createReview,
  getProductReviews
};
