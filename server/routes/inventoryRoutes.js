import express from 'express';
import {
  getInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryAnalytics,
  exportInventoryCsv,
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All inventory routes require login

router.get('/analytics/summary', authorize('Admin', 'Staff'), getInventoryAnalytics);
router.get('/export/csv', authorize('Admin', 'Staff'), exportInventoryCsv);

router.route('/')
  .get(getInventory)
  .post(authorize('Admin', 'Staff'), createInventoryItem);

router.route('/:id')
  .get(getInventoryById)
  .put(authorize('Admin', 'Staff'), updateInventoryItem)
  .delete(authorize('Admin'), deleteInventoryItem);

export default router;
