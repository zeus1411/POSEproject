/**
 * Location Service
 * Wraps vietnamAddressService for consistency
 */

import {
  getProvinces,
  getDistricts,
  getWards
} from './vietnamAddressService.js';

class LocationService {
  /**
   * Get all provinces
   * @returns {Promise<Array>} List of provinces
   */
  async getProvinces() {
    return await getProvinces();
  }

  /**
   * Get districts by province ID
   * @param {number} provinceId - Province ID
   * @returns {Promise<Array>} List of districts
   */
  async getDistricts(provinceId) {
    return await getDistricts(parseInt(provinceId));
  }

  /**
   * Get wards by district ID
   * @param {number} districtId - District ID
   * @returns {Promise<Array>} List of wards
   */
  async getWards(districtId) {
    return await getWards(parseInt(districtId));
  }
}

// Export singleton instance
export default new LocationService();
