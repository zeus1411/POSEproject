import api from './api';

export const getUserOrders = async (page = 1, limit = 10, status) => {
  const params = { page, limit };
  if (status) params.status = status;
  const response = await api.get('/orders', { params });
  return response.data?.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  // Backend returns { success, data: { order } }, so return the raw order doc
  return response.data?.data?.order;
};

export const previewOrder = async (promotionCode) => {
  const response = await api.get('/orders/preview', { params: promotionCode ? { promotionCode } : {} });
  return response.data?.data;
};

export const createOrder = async ({ shippingAddress, paymentMethod = 'COD', promotionCode, notes }) => {
  try {
    const response = await api.post('/orders', { 
      shippingAddress, 
      paymentMethod, 
      promotionCode, 
      notes 
    });
    
    // Return the full response data for both COD and VNPay
    // DO NOT redirect here - let the component handle it
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Cancel an order
 * @param {string} orderId - The ID of the order to cancel
 * @returns {Promise<Object>} The updated order
 */
export const cancelOrder = async (orderId) => {
  try {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data?.data?.order || response.data?.data || response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

/**
 * Simulate VNPay payment success (for testing)
 * @param {string} orderId - The ID of the order
 * @param {string} transactionId - The transaction ID from payment
 * @returns {Promise<Object>} The updated payment and order
 */
export const simulateVNPaySuccess = async (orderId, transactionId) => {
  try {
    const response = await api.post(`/orders/${orderId}/payment/vnpay/simulate`, {
      transactionId,
      responseCode: '00' // Success code
    });
    return response.data?.data;
  } catch (error) {
    console.error('Error simulating VNPay payment:', error);
    throw error;
  }
};

export const getOrderStatistics = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await api.get('/orders/admin/statistics', { params });
  return response.data?.data;
};

export default { 
  getUserOrders, 
  getOrderById, 
  previewOrder, 
  createOrder, 
  cancelOrder,
  simulateVNPaySuccess,
  getOrderStatistics
};