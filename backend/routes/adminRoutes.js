import express from 'express';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';
import { countUsers, getUserOrders, updateUserAdminStatus, validateAdminToken, adminLogin } from '../controllers/userController.js';
import { getAllOrders, updateOrderStatus, searchOrders } from '../controllers/orderController.js';
import { addProduct, updateProduct, removeProduct } from '../controllers/productController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

// Public admin routes
router.post('/login', adminLogin);

// Protected admin routes - all routes below this use adminAuthMiddleware
router.use(adminAuthMiddleware);

// Admin validation route
router.get('/validate', validateAdminToken);

// Dashboard route
router.get('/stats/dashboard', getDashboardStats);

// User management routes
router.get('/users/count', countUsers);
router.get('/users/:userId/orders', getUserOrders);
router.patch('/users/:userId/admin-status', updateUserAdminStatus);

// Order management routes
router.get('/orders', getAllOrders);
router.get('/orders/search', searchOrders);
router.patch('/orders/:orderId/status', updateOrderStatus);

// Product management routes
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', removeProduct);

export default router;