import Address from '../models/Address.js';
import { BadRequestError, NotFoundError } from '../utils/errorHandler.js';

/**
 * Address Service
 * Contains all business logic for address operations
 */

class AddressService {
  /**
   * Get all user addresses
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of addresses
   */
  async getUserAddresses(userId) {
    return await Address.find({ userId }).sort('-isDefault -createdAt');
  }

  /**
   * Get default address
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Default address or null
   */
  async getDefaultAddress(userId) {
    return await Address.findOne({ userId, isDefault: true });
  }

  /**
   * Get address by ID
   * @param {string} addressId - Address ID
   * @param {string} userId - User ID (for ownership check)
   * @returns {Promise<Object>} Address object
   */
  async getAddressById(addressId, userId) {
    const address = await Address.findOne({ _id: addressId, userId });
    
    if (!address) {
      throw new NotFoundError('Không tìm thấy địa chỉ');
    }
    
    return address;
  }

  /**
   * Create new address
   * @param {string} userId - User ID
   * @param {Object} addressData - Address data
   * @returns {Promise<Object>} Created address
   */
  async createAddress(userId, addressData) {
    const data = { ...addressData, userId };
    
    // If first address, set as default
    const existingAddresses = await Address.countDocuments({ userId });
    if (existingAddresses === 0) {
      data.isDefault = true;
    }
    
    return await Address.create(data);
  }

  /**
   * Update address
   * @param {string} addressId - Address ID
   * @param {string} userId - User ID (for ownership check)
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated address
   */
  async updateAddress(addressId, userId, updateData) {
    const address = await Address.findOne({ _id: addressId, userId });
    
    if (!address) {
      throw new NotFoundError('Không tìm thấy địa chỉ');
    }
    
    const allowedFields = [
      'fullName',
      'phone',
      'street',
      'ward',
      'wardCode',
      'district',
      'districtId',
      'city',
      'cityId',
      'postalCode',
      'type',
      'isDefault',
      'notes'
    ];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        address[field] = updateData[field];
      }
    });
    
    await address.save();
    return address;
  }

  /**
   * Delete address
   * @param {string} addressId - Address ID
   * @param {string} userId - User ID (for ownership check)
   * @returns {Promise<void>}
   */
  async deleteAddress(addressId, userId) {
    const address = await Address.findOne({ _id: addressId, userId });
    
    if (!address) {
      throw new NotFoundError('Không tìm thấy địa chỉ');
    }
    
    // Cannot delete default address if there are others
    if (address.isDefault) {
      const otherAddresses = await Address.countDocuments({ 
        userId, 
        _id: { $ne: addressId } 
      });
      
      if (otherAddresses > 0) {
        throw new BadRequestError(
          'Không thể xóa địa chỉ mặc định. Vui lòng chọn địa chỉ khác làm mặc định trước.'
        );
      }
    }
    
    await address.deleteOne();
  }

  /**
   * Set address as default
   * @param {string} addressId - Address ID
   * @param {string} userId - User ID (for ownership check)
   * @returns {Promise<Object>} Updated address
   */
  async setDefaultAddress(addressId, userId) {
    const address = await Address.findOne({ _id: addressId, userId });
    
    if (!address) {
      throw new NotFoundError('Không tìm thấy địa chỉ');
    }
    
    // Remove default from all other addresses
    await Address.updateMany(
      { userId, _id: { $ne: addressId } },
      { $set: { isDefault: false } }
    );
    
    // Set this address as default
    address.isDefault = true;
    await address.save();
    
    return address;
  }
}

// Export singleton instance
export default new AddressService();
