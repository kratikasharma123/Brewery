import express from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  getUserProfile,
  chooseUserRole,
  syncFirebaseUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/firebase-sync', syncFirebaseUser);
router.patch('/role', protect, chooseUserRole);
router.get('/profile', protect, getUserProfile);

export default router;
