import axios from 'axios';

// Sử dụng API miễn phí: provinces.open-api.vn
const API_BASE_URL = process.env.PROVINCES_OPEN_API;

/**
 * Location Service
 * Handles all location-related operations (provinces, districts, wards)
 */
class LocationService {
  /**
   * Get all provinces
   * @returns {Promise<Array>} List of provinces
   */
  async getProvinces() {
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
  }

  /**
   * Get province detail with districts
   * @param {number} provinceId - Province ID
   * @returns {Promise<Object>} Province detail with districts
   */
  async getProvinceDetail(provinceId) {
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
  }

  /**
   * Get districts by province ID
   * @param {number} provinceId - Province ID
   * @returns {Promise<Array>} List of districts
   */
  async getDistricts(provinceId) {
    try {
      const provinceDetail = await this.getProvinceDetail(parseInt(provinceId));
      return provinceDetail.districts;
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw new Error('Không thể lấy danh sách quận/huyện');
    }
  }

  /**
   * Get district detail with wards
   * @param {number} districtId - District ID
   * @returns {Promise<Object>} District detail with wards
   */
  async getDistrictDetail(districtId) {
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
  }

  /**
   * Get wards by district ID
   * @param {number} districtId - District ID
   * @returns {Promise<Array>} List of wards
   */
  async getWards(districtId) {
    try {
      const districtDetail = await this.getDistrictDetail(parseInt(districtId));
      return districtDetail.wards;
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw new Error('Không thể lấy danh sách phường/xã');
    }
  }
}

// Export singleton instance
export default new LocationService();
