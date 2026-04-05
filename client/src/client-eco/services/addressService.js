import api from './api';

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
  getProvinces,
  getDistricts,
  getWards
};

export default addressService;