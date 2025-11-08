import { StatusCodes } from 'http-status-codes';
import {
  getProvinces,
  getDistricts,
  getWards
} from '../services/vietnamAddressService.js';

// @desc    Lấy danh sách tỉnh/thành phố
// @route   GET /api/v1/locations/provinces
// @access  Public
export const fetchProvinces = async (req, res) => {
  const provinces = await getProvinces();
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { provinces }
  });
};

// @desc    Lấy danh sách quận/huyện
// @route   GET /api/v1/locations/districts/:provinceId
// @access  Public
export const fetchDistricts = async (req, res) => {
  const { provinceId } = req.params;
  
  const districts = await getDistricts(parseInt(provinceId));
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { districts }
  });
};

// @desc    Lấy danh sách phường/xã
// @route   GET /api/v1/locations/wards/:districtId
// @access  Public
export const fetchWards = async (req, res) => {
  const { districtId } = req.params;
  
  const wards = await getWards(parseInt(districtId));
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { wards }
  });
};

export default {
  fetchProvinces,
  fetchDistricts,
  fetchWards
};