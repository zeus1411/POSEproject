import api from './api';

// ========== ADDRESS ENDPOINTS ==========

// Lấy tất cả địa chỉ của user
const getUserAddresses = async () => {
  const response = await api.get('/addresses');
  return response.data;
};

// Lấy địa chỉ mặc định
const getDefaultAddress = async () => {
  const response = await api.get('/addresses/default');
  return response.data;
};

// Lấy chi tiết 1 địa chỉ
const getAddressById = async (id) => {
  const response = await api.get(`/addresses/${id}`);
  return response.data;
};

// Tạo địa chỉ mới
const createAddress = async (addressData) => {
  const response = await api.post('/addresses', addressData);
  return response.data;
};

// Cập nhật địa chỉ
const updateAddress = async (id, addressData) => {
  const response = await api.patch(`/addresses/${id}`, addressData);
  return response.data;
};

// Xóa địa chỉ
const deleteAddress = async (id) => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
};

// Đặt địa chỉ mặc định
const setDefaultAddress = async (id) => {
  const response = await api.patch(`/addresses/${id}/set-default`);
  return response.data;
};

// ========== LOCATION ENDPOINTS ==========

// Lấy danh sách tỉnh/thành phố
const getProvinces = async () => {
  const response = await api.get('/locations/provinces');
  return response.data;
};

// Lấy danh sách quận/huyện
const getDistricts = async (provinceId) => {
  const response = await api.get(`/locations/districts/${provinceId}`);
  return response.data;
};

// Lấy danh sách phường/xã
const getWards = async (districtId) => {
  const response = await api.get(`/locations/wards/${districtId}`);
  return response.data;
};

const addressService = {
  getUserAddresses,
  getDefaultAddress,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getProvinces,
  getDistricts,
  getWards
};

export default addressService;