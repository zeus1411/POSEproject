import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar as uploadAvatarController,
  getAllUsers,
  getUserByIdAdmin,
  updateUserByAdmin,
  deleteUserByAdmin
} from '../controllers/userController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';
import { uploadAvatar } from '../middlewares/upload.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/change-password', changePassword);
router.patch('/avatar', uploadAvatar.single('avatar'), uploadAvatarController);

router.get('/admin', authorizeRoles('admin'), getAllUsers);
router.get('/admin/:id', authorizeRoles('admin'), getUserByIdAdmin);
router.put('/admin/:id', authorizeRoles('admin'), updateUserByAdmin);
router.delete('/admin/:id', authorizeRoles('admin'), deleteUserByAdmin);

export default router;