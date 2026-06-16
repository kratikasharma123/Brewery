import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', protect, authorize('Admin', 'Staff'), getDashboardSummary);

export default router;
