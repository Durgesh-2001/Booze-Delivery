import express from 'express';
import { createOrder, getOrderHistory, getOrderStatus, getAllOrders, updateOrderStatus, cancelOrder } from '../controllers/orderController.js';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/status/:orderId', getOrderStatus);

// User authenticated routes
router.use(authenticateToken);
router.post('/create', createOrder);
router.get('/history', getOrderHistory);

// Admin only routes
router.get('/admin/all', adminAuthMiddleware, getAllOrders);
router.patch('/admin/:orderId/status', adminAuthMiddleware, updateOrderStatus);

// **Add the new PATCH route for cancelling orders**
router.patch('/:orderId/cancel', authenticateToken, cancelOrder);

export default router;
