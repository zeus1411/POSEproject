import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError, UnauthenticatedError } from '../utils/errorHandler.js';

// @desc    Cập nhật profile (thông tin cá nhân + địa chỉ)
// @route   PATCH /api/v1/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  
  const user = await User.findById(userId);
  
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }
  
  // Các field được phép update
  const allowedPersonalFields = [
    'fullName',
    'phone',
    'dateOfBirth',
    'gender',
    'username'
  ];
  
  // Update personal info
  allowedPersonalFields.forEach(field => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  
  // Validate username if being changed
  if (req.body.username && req.body.username !== user.username) {
    const existingUser = await User.findOne({ 
      username: req.body.username,
      _id: { $ne: userId } // Exclude current user
    });
    if (existingUser) {
      throw new BadRequestError('Tên người dùng đã được sử dụng');
    }
  }
  
  // Update address (nếu có)
  if (req.body.address) {
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
      if (req.body.address[field] !== undefined) {
        user.address[field] = req.body.address[field];
      }
    });
  }
  
  await user.save();
  
  // Trả về user (không bao gồm password)
  const updatedUser = await User.findById(userId).select('-password');
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cập nhật thông tin thành công',
    data: { user: updatedUser }
  });
};

// @desc    Lấy thông tin profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  const userId = req.user.userId;
  
  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { user }
  });
};

// @desc    Đổi mật khẩu
// @route   PATCH /api/v1/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
  }
  
  if (newPassword !== confirmPassword) {
    throw new BadRequestError('Mật khẩu mới không khớp');
  }
  
  if (newPassword.length < 6) {
    throw new BadRequestError('Mật khẩu phải có ít nhất 6 ký tự');
  }
  
  // Lấy user kèm password
  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }
  
  // Kiểm tra mật khẩu hiện tại
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  
  if (!isPasswordCorrect) {
    throw new BadRequestError('Mật khẩu hiện tại không đúng');
  }
  
  // Cập nhật mật khẩu mới
  user.password = newPassword;
  await user.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đổi mật khẩu thành công'
  });
};

// @desc    Upload user avatar
// @route   PATCH /api/v1/users/avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Vui lòng tải lên ảnh đại diện');
    }

    console.log('Uploading avatar for user ID:', req.user?.userId);
    console.log('File path:', req.file.path);

    if (!req.user?.userId) {
      console.error('No user ID in request');
      throw new UnauthenticatedError('Không tìm thấy thông tin người dùng');
    }

    // First find the user to ensure they exist
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      console.error('User not found with ID:', req.user.userId);
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // Update the avatar field
    user.avatar = req.file.path;
    
    // Save the user document
    await user.save({ validateBeforeSave: false });

    // Get the updated user without the password field
    const updatedUser = await User.findById(user._id).select('-password');

    console.log('✅ Avatar updated successfully:', {
      userId: updatedUser._id,
      avatar: updatedUser.avatar
    });

    // ✅ FIX: Return consistent structure
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('❌ Error in uploadAvatar:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
      file: req.file
    });
    next(error);
  }
};

// ========== ADMIN USER MANAGEMENT ==========

// @desc    Danh sách người dùng (Admin)
// @route   GET /api/v1/users/admin
// @access  Private (admin)
export const getAllUsers = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  // Tìm kiếm theo username / email / fullName / phone
  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [
      { username: regex },
      { email: regex },
      { fullName: regex },
      { phone: regex }
    ];
  }

  // Filter theo role
  if (role && ['user', 'admin'].includes(role)) {
    query.role = role;
  }

  // Filter theo trạng thái hoạt động
  if (typeof isActive !== 'undefined') {
    if (isActive === 'true' || isActive === true) query.isActive = true;
    if (isActive === 'false' || isActive === false) query.isActive = false;
  }

  // Pagination
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(parseInt(limit, 10) || 10, 100);
  const skip = (pageNumber - 1) * pageSize;

  // Sort whitelist
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

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: pageNumber,
        pageSize
      }
    }
  });
};

// @desc    Lấy chi tiết 1 user (Admin)
// @route   GET /api/v1/users/admin/:id
// @access  Private (admin)
export const getUserByIdAdmin = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
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

  res.status(StatusCodes.OK).json({
    success: true,
    data: { user }
  });
};

// @desc    Admin cập nhật thông tin user / role / trạng thái
// @route   PUT /api/v1/users/admin/:id
// @access  Private (admin)
export const updateUserByAdmin = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }

  // Không cho update password trực tiếp ở đây
  if (req.body.password || req.body.newPassword) {
    throw new BadRequestError('Không thể đổi mật khẩu qua API này');
  }

  // ✅ Nếu muốn thay đổi role, phải nhập đầy đủ thông tin bắt buộc
  if (req.body.role !== undefined && req.body.role !== user.role) {
    const requiredFields = ['fullName', 'phone', 'dateOfBirth', 'gender'];
    const missingFields = [];
    
    requiredFields.forEach(field => {
      const value = req.body[field] !== undefined ? req.body[field] : user[field];
      // Check if field is missing or empty
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

  // ✅ Xử lý gender: nếu là empty string thì set null
  if (req.body.gender !== undefined) {
    if (req.body.gender === '' || req.body.gender === null) {
      req.body.gender = null;
    } else if (!['male', 'female'].includes(req.body.gender)) {
      throw new BadRequestError('Giới tính không hợp lệ. Chỉ chấp nhận: male, female hoặc để trống');
    }
  }

  // Các field thông tin cá nhân được phép sửa (không bao gồm email)
  const allowedPersonalFields = [
    'fullName',
    'phone',
    'dateOfBirth',
    'gender',
    'username'
  ];

  allowedPersonalFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  // Validate username if being changed
  if (req.body.username && req.body.username !== user.username) {
    const existingUser = await User.findOne({ 
      username: req.body.username,
      _id: { $ne: id } // Exclude current user
    });
    if (existingUser) {
      throw new BadRequestError('Tên người dùng đã được sử dụng');
    }
  }

  // Cập nhật địa chỉ (nếu có)
  if (req.body.address) {
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
      if (req.body.address[field] !== undefined) {
        user.address[field] = req.body.address[field];
      }
    });
  }

  // Cập nhật role
  if (req.body.role !== undefined) {
    const newRole = req.body.role;
    if (!['user', 'admin'].includes(newRole)) {
      throw new BadRequestError('Vai trò không hợp lệ');
    }
    user.role = newRole;
  }

  await user.save();

  const updatedUser = await User.findById(id).select(
    '-password -resetPasswordOTP -resetPasswordToken -resetPasswordExpires'
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cập nhật người dùng thành công',
    data: { user: updatedUser }
  });
};

// @desc    Xóa user (Admin)
// @route   DELETE /api/v1/users/admin/:id
// @access  Private (admin)
export const deleteUserByAdmin = async (req, res) => {
  const { id } = req.params;

  // Không cho admin tự xóa chính mình
  if (req.user.userId === id) {
    throw new BadRequestError('Bạn không thể xóa tài khoản của chính mình');
  }

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }

  // Hard delete: xóa hoàn toàn từ database
  await User.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Người dùng đã được xóa thành công'
  });
};


export default {
  updateProfile,
  getProfile,
  changePassword,
  uploadAvatar,
  getAllUsers,
  getUserByIdAdmin,
  updateUserByAdmin,
  deleteUserByAdmin
};