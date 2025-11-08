import Address from '../models/Address.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../utils/errorHandler.js';

// @desc    Lấy tất cả địa chỉ của user
// @route   GET /api/v1/addresses
// @access  Private
export const getUserAddresses = async (req, res) => {
  const userId = req.user.userId;
  
  const addresses = await Address.find({ userId }).sort('-isDefault -createdAt');
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { addresses }
  });
};

// @desc    Lấy địa chỉ mặc định
// @route   GET /api/v1/addresses/default
// @access  Private
export const getDefaultAddress = async (req, res) => {
  const userId = req.user.userId;
  
  const address = await Address.findOne({ userId, isDefault: true });
  
  if (!address) {
    return res.status(StatusCodes.OK).json({
      success: true,
      data: { address: null }
    });
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { address }
  });
};

// @desc    Lấy chi tiết 1 địa chỉ
// @route   GET /api/v1/addresses/:id
// @access  Private
export const getAddressById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  const address = await Address.findOne({ _id: id, userId });
  
  if (!address) {
    throw new NotFoundError('Không tìm thấy địa chỉ');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { address }
  });
};

// @desc    Tạo địa chỉ mới
// @route   POST /api/v1/addresses
// @access  Private
export const createAddress = async (req, res) => {
  const userId = req.user.userId;
  const addressData = { ...req.body, userId };
  
  // Nếu chưa có địa chỉ nào, tự động set làm mặc định
  const existingAddresses = await Address.countDocuments({ userId });
  if (existingAddresses === 0) {
    addressData.isDefault = true;
  }
  
  const address = await Address.create(addressData);
  
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Thêm địa chỉ thành công',
    data: { address }
  });
};

// @desc    Cập nhật địa chỉ
// @route   PATCH /api/v1/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  const address = await Address.findOne({ _id: id, userId });
  
  if (!address) {
    throw new NotFoundError('Không tìm thấy địa chỉ');
  }
  
  // Cập nhật các field
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
    if (req.body[field] !== undefined) {
      address[field] = req.body[field];
    }
  });
  
  await address.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cập nhật địa chỉ thành công',
    data: { address }
  });
};

// @desc    Xóa địa chỉ
// @route   DELETE /api/v1/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  const address = await Address.findOne({ _id: id, userId });
  
  if (!address) {
    throw new NotFoundError('Không tìm thấy địa chỉ');
  }
  
  // Không cho xóa địa chỉ mặc định nếu còn địa chỉ khác
  if (address.isDefault) {
    const otherAddresses = await Address.countDocuments({ 
      userId, 
      _id: { $ne: id } 
    });
    
    if (otherAddresses > 0) {
      throw new BadRequestError(
        'Không thể xóa địa chỉ mặc định. Vui lòng chọn địa chỉ khác làm mặc định trước.'
      );
    }
  }
  
  await address.deleteOne();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Xóa địa chỉ thành công'
  });
};

// @desc    Đặt địa chỉ mặc định
// @route   PATCH /api/v1/addresses/:id/set-default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  const address = await Address.findOne({ _id: id, userId });
  
  if (!address) {
    throw new NotFoundError('Không tìm thấy địa chỉ');
  }
  
  // Bỏ default của tất cả địa chỉ khác
  await Address.updateMany(
    { userId, _id: { $ne: id } },
    { $set: { isDefault: false } }
  );
  
  // Set địa chỉ này làm mặc định
  address.isDefault = true;
  await address.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã đặt làm địa chỉ mặc định',
    data: { address }
  });
};

export default {
  getUserAddresses,
  getDefaultAddress,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};