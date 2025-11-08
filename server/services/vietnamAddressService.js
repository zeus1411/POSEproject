import axios from 'axios';

// Sử dụng API miễn phí: provinces.open-api.vn
const API_BASE_URL = process.env.PROVINCES_OPEN_API;

/**
 * Lấy danh sách tỉnh/thành phố
 */
export const getProvinces = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/p/`);
    return response.data.map(province => ({
      id: province.code,
      name: province.name,
      nameEn: province.name_en,
      fullName: province.full_name,
      fullNameEn: province.full_name_en
    }));
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw new Error('Không thể lấy danh sách tỉnh/thành phố');
  }
};

/**
 * Lấy chi tiết tỉnh/thành phố (bao gồm districts)
 * @param {number} provinceId - Mã tỉnh/thành phố
 */
export const getProvinceDetail = async (provinceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/p/${provinceId}?depth=2`);
    return {
      id: response.data.code,
      name: response.data.name,
      fullName: response.data.full_name,
      districts: response.data.districts.map(district => ({
        id: district.code,
        name: district.name,
        fullName: district.full_name
      }))
    };
  } catch (error) {
    console.error('Error fetching province detail:', error);
    throw new Error('Không thể lấy thông tin tỉnh/thành phố');
  }
};

/**
 * Lấy danh sách quận/huyện theo tỉnh
 * @param {number} provinceId - Mã tỉnh/thành phố
 */
export const getDistricts = async (provinceId) => {
  try {
    const provinceDetail = await getProvinceDetail(provinceId);
    return provinceDetail.districts;
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw new Error('Không thể lấy danh sách quận/huyện');
  }
};

/**
 * Lấy chi tiết quận/huyện (bao gồm wards)
 * @param {number} districtId - Mã quận/huyện
 */
export const getDistrictDetail = async (districtId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/d/${districtId}?depth=2`);
    return {
      id: response.data.code,
      name: response.data.name,
      fullName: response.data.full_name,
      wards: response.data.wards.map(ward => ({
        id: ward.code,
        name: ward.name,
        fullName: ward.full_name
      }))
    };
  } catch (error) {
    console.error('Error fetching district detail:', error);
    throw new Error('Không thể lấy thông tin quận/huyện');
  }
};

/**
 * Lấy danh sách phường/xã theo quận
 * @param {number} districtId - Mã quận/huyện
 */
export const getWards = async (districtId) => {
  try {
    const districtDetail = await getDistrictDetail(districtId);
    return districtDetail.wards;
  } catch (error) {
    console.error('Error fetching wards:', error);
    throw new Error('Không thể lấy danh sách phường/xã');
  }
};

export default {
  getProvinces,
  getProvinceDetail,
  getDistricts,
  getDistrictDetail,
  getWards
};