import express from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  getUserProfile,
  chooseUserRole,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.patch('/role', protect, chooseUserRole);
router.get('/profile', protect, getUserProfile);

export default router;
