import express from 'express';
import { cancelOrder, createOrder, getMyOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMyOrders)
  .post(createOrder);

router.patch('/:id/cancel', cancelOrder);

export default router;
