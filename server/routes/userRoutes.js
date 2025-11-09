import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar as uploadAvatarController
} from '../controllers/userController.js';
import { authenticateUser } from '../middlewares/auth.js';
import { uploadAvatar } from '../middlewares/upload.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/change-password', changePassword);
router.patch('/avatar', uploadAvatar.single('avatar'), uploadAvatarController);

export default router;