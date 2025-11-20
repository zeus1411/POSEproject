import User from '../models/User.js';
import { BadRequestError, NotFoundError, UnauthenticatedError } from '../utils/errorHandler.js';

/**
 * User Service
 * Contains all business logic for user management operations
 */

class UserService {
  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Profile update data
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }
    
    const allowedPersonalFields = [
      'fullName',
      'phone',
      'dateOfBirth',
      'gender',
      'username'
    ];
    
    allowedPersonalFields.forEach(field => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });
    
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await User.findOne({ 
        username: updateData.username,
        _id: { $ne: userId }
      });
      if (existingUser) {
        throw new BadRequestError('Tên người dùng đã được sử dụng');
      }
    }
    
    if (updateData.address) {
      const allowedAddressFields = [
        'street',
        'ward',
        'wardCode',
        'district',
        'districtId',
        'city',
        'cityId',
        'country',
        'postalCode',
        'notes'
      ];
      
      if (!user.address) {
        user.address = {};
      }
      
      allowedAddressFields.forEach(field => {
        if (updateData.address[field] !== undefined) {
          user.address[field] = updateData.address[field];
        }
      });
    }
    
    await user.save();
    return await User.findById(userId).select('-password');
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }
    
    return user;
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {Object} passwordData - { currentPassword, newPassword, confirmPassword }
   * @returns {Promise<void>}
   */
  async changePassword(userId, passwordData) {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
    }
    
    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Mật khẩu mới không khớp');
    }
    
    if (newPassword.length < 6) {
      throw new BadRequestError('Mật khẩu phải có ít nhất 6 ký tự');
    }
    
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }
    
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    
    if (!isPasswordCorrect) {
      throw new BadRequestError('Mật khẩu hiện tại không đúng');
    }
    
    user.password = newPassword;
    await user.save();
  }

  /**
   * Upload user avatar
   * @param {string} userId - User ID
   * @param {Object} file - Uploaded file object from multer
   * @returns {Promise<Object>} Updated user
   */
  async uploadAvatar(userId, file) {
    if (!file) {
      throw new BadRequestError('Vui lòng tải lên ảnh đại diện');
    }

    if (!userId) {
      throw new UnauthenticatedError('Không tìm thấy thông tin người dùng');
    }

    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // Update avatar with file path from Cloudinary
    user.avatar = file.path;
    await user.save({ validateBeforeSave: false });

    return await User.findById(userId).select('-password');
  }

  /**
   * Get all users (Admin)
   * @param {Object} filters - Filter and pagination options
   * @param {string} currentUserId - Current admin user ID (to exclude from list)
   * @returns {Promise<Object>} Users with pagination
   */
  async getAllUsers(filters, currentUserId) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const query = {};
    query._id = { $ne: currentUserId };

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { username: regex },
        { email: regex },
        { fullName: regex },
        { phone: regex }
      ];
    }

    if (role && ['user', 'admin'].includes(role)) {
      query.role = role;
    }

    if (typeof isActive !== 'undefined') {
      if (isActive === 'true' || isActive === true) query.isActive = true;
      if (isActive === 'false' || isActive === false) query.isActive = false;
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(parseInt(limit, 10) || 10, 100);
    const skip = (pageNumber - 1) * pageSize;

    const sortFieldWhitelist = ['createdAt', 'updatedAt', 'lastLogin', 'username', 'email'];
    const field = sortFieldWhitelist.includes(sortBy) ? sortBy : 'createdAt';
    const direction = sortOrder === 'asc' ? 1 : -1;
    const sort = { [field]: direction };

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password -resetPasswordOTP -resetPasswordToken -resetPasswordExpires')
        .sort(sort)
        .skip(skip)
        .limit(pageSize),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalUsers / pageSize);

    return {
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: pageNumber,
        pageSize
      }
    };
  }

  /**
   * Get user by ID (Admin)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User with populated relations
   */
  async getUserByIdAdmin(userId) {
    const user = await User.findById(userId)
      .select('-password -resetPasswordOTP -resetPasswordToken -resetPasswordExpires')
      .populate({
        path: 'orders',
        select: 'orderNumber status totalAmount createdAt'
      })
      .populate({
        path: 'reviews',
        select: 'rating comment productId createdAt'
      })
      .populate({
        path: 'payments',
        select: 'amount status method createdAt'
      });

    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    return user;
  }

  /**
   * Update user by admin
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated user
   */
  async updateUserByAdmin(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    if (updateData.password || updateData.newPassword) {
      throw new BadRequestError('Không thể đổi mật khẩu qua API này');
    }

    if (updateData.role !== undefined && updateData.role !== user.role) {
      const requiredFields = ['fullName', 'phone', 'dateOfBirth', 'gender'];
      const missingFields = [];
      
      requiredFields.forEach(field => {
        const value = updateData[field] !== undefined ? updateData[field] : user[field];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        const fieldLabels = {
          fullName: 'Họ và tên',
          phone: 'Số điện thoại',
          dateOfBirth: 'Ngày sinh',
          gender: 'Giới tính'
        };
        const missingLabels = missingFields.map(f => fieldLabels[f]).join(', ');
        throw new BadRequestError(
          `Để thay đổi vai trò, vui lòng cập nhật đầy đủ các thông tin sau: ${missingLabels}`
        );
      }
    }

    if (updateData.gender !== undefined) {
      if (updateData.gender === '' || updateData.gender === null) {
        updateData.gender = null;
      } else if (!['male', 'female'].includes(updateData.gender)) {
        throw new BadRequestError('Giới tính không hợp lệ. Chỉ chấp nhận: male, female hoặc để trống');
      }
    }

    const allowedPersonalFields = [
      'fullName',
      'phone',
      'dateOfBirth',
      'gender',
      'username'
    ];

    allowedPersonalFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await User.findOne({ 
        username: updateData.username,
        _id: { $ne: userId }
      });
      if (existingUser) {
        throw new BadRequestError('Tên người dùng đã được sử dụng');
      }
    }

    if (updateData.address) {
      const allowedAddressFields = [
        'street',
        'ward',
        'wardCode',
        'district',
        'districtId',
        'city',
        'cityId',
        'country',
        'postalCode',
        'notes'
      ];

      if (!user.address) {
        user.address = {};
      }

      allowedAddressFields.forEach((field) => {
        if (updateData.address[field] !== undefined) {
          user.address[field] = updateData.address[field];
        }
      });
    }

    if (updateData.role !== undefined) {
      const newRole = updateData.role;
      if (!['user', 'admin'].includes(newRole)) {
        throw new BadRequestError('Vai trò không hợp lệ');
      }
      user.role = newRole;
    }

    await user.save();

    return await User.findById(userId).select(
      '-password -resetPasswordOTP -resetPasswordToken -resetPasswordExpires'
    );
  }

  /**
   * Delete user by admin
   * @param {string} userId - User ID to delete
   * @param {string} currentUserId - Current admin user ID
   * @returns {Promise<void>}
   */
  async deleteUserByAdmin(userId, currentUserId) {
    if (currentUserId === userId) {
      throw new BadRequestError('Bạn không thể xóa tài khoản của chính mình');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    await User.findByIdAndDelete(userId);
  }
}

// Export singleton instance
export default new UserService();
