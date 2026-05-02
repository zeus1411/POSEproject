import { StatusCodes } from 'http-status-codes';
import tagService from '../services/tagService.js';

/**
 * Tag Controller
 * Handles HTTP requests and responses for tags
 */

// @desc    Get all tags
// @route   GET /api/v1/tags
// @access  Public
export const getAllTags = async (req, res, next) => {
    try {
        const result = await tagService.getAllTags(req.query);
        res.status(StatusCodes.OK).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get tag by ID
// @route   GET /api/v1/tags/:id
// @access  Public
export const getTagById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tag = await tagService.getTagById(id);
        res.status(StatusCodes.OK).json({
            success: true,
            tag
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new tag
// @route   POST /api/v1/tags
// @access  Private (Admin)
export const createTag = async (req, res, next) => {
    try {
        const tag = await tagService.createTag(req.body);
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Tạo thẻ (tag) thành công',
            tag
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update tag
// @route   PUT /api/v1/tags/:id
// @access  Private (Admin)
export const updateTag = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tag = await tagService.updateTag(id, req.body);
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Cập nhật thẻ thành công',
            tag
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete tag
// @route   DELETE /api/v1/tags/:id
// @access  Private (Admin)
export const deleteTag = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await tagService.deleteTag(id);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const updateTagStatus = async (req,res,next)=>{
 try{
   const {id}=req.params;
   const {isActive}=req.body;

   const tag = await tagService.updateTagStatus(id,isActive);

   res.status(200).json({
      success:true,
      tag
   });

 }catch(error){
   next(error);
 }
};