import express from 'express';
import {
  addAttendance,
  createStaff,
  deleteStaff,
  getStaff,
  getStaffById,
  updateStaff,
} from '../controllers/staffController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.route('/').get(getStaff).post(createStaff);
router.route('/:id').get(getStaffById).put(updateStaff).delete(deleteStaff);
router.post('/:id/attendance', addAttendance);

export default router;
