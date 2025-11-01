import api from './api';

export const getUserOrders = async (page = 1, limit = 10, status) => {
  const params = { page, limit };
  if (status) params.status = status;
  const response = await api.get('/orders', { params });
  return response.data?.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data?.data;
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

export default { getUserOrders, getOrderById, previewOrder, createOrder };