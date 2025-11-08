import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/userController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/change-password', changePassword);

export default router;