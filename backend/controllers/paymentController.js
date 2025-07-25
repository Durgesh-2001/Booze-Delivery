import dotenv from 'dotenv';

dotenv.config();

const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: 'order_' + Date.now()
        };

        // Send basic order details without Razorpay validation
        res.json({
            success: true,
            order: {
                id: options.receipt,
                amount: options.amount,
                currency: options.currency
            },
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

// Simple payment confirmation without signature verification
const confirmPayment = async (req, res) => {
    try {
        const { paymentId, orderId } = req.body;

        res.json({
            success: true,
            message: "Payment confirmed successfully",
            data: {
                paymentId,
                orderId,
                status: 'completed'
            }
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({
            success: false,
            message: "Error confirming payment",
            error: error.message
        });
    }
};

export { createOrder, confirmPayment };