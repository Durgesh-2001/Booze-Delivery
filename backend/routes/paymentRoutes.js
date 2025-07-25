import express from 'express';
import { createOrder, confirmPayment } from '../controllers/paymentController.js';

const router = express.Router();

// Create order
router.post('/create-order', createOrder);

// Confirm payment
router.post('/confirm', confirmPayment);

export default router;