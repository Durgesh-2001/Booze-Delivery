import express from 'express';
import { loginUser, registerUser, getUserProfile, initializeAdmin, saveAddress, getAddresses } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/initialize-admin', initializeAdmin);

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'User routes working!' });
});

// Address routes
router.post('/address', authenticateToken, saveAddress);
router.get('/address/:userId', authenticateToken, getAddresses);

// Protected routes
router.get('/profile', authenticateToken, getUserProfile);

export default router;