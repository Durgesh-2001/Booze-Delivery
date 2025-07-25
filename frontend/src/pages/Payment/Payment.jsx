import React, { useEffect, useState } from 'react';
import './Payment.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Payment = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { token, user } = useAuth();

  const [totalAmount, setTotalAmount] = useState(0);
  const [finalTotalPaid, setFinalTotalPaid] = useState(0);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [paymentError, setPaymentError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const userDetails = {
    name: user?.name || 'Guest User',
    email: user?.email || 'test@gmail.com',
    contact: user?.phone || '9999999999'
  };

  const testCardDetails = {
    number: '4111 1111 1111 1111',
    expiry: '12/27',
    cvv: '123'
  };

  useEffect(() => {
    const total = parseFloat(localStorage.getItem('cartTotalAmount')) || 0;
    setTotalAmount(total);

    if (!cart?.items?.length && !orderConfirmed && total <= 0) {
      alert("Cart is empty. Redirecting to cart...");
      navigate('/cart');
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [cart, navigate, orderConfirmed]);

  const handlePayment = () => {
    setPaymentError(null);

    if (!token) {
      alert("Please login to proceed with payment.");
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === 'cod' || paymentMethod === 'upi') {
      const mockPaymentId = `MOCK-${paymentMethod.toUpperCase()}-${Date.now()}`;
      createOrder(mockPaymentId, 'pending');
      return;
    }

    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: totalAmount * 100,
      currency: 'INR',
      name: 'Alcohol Store',
      description: 'Alcohol Purchase',
      handler: function (response) {
        if (response.razorpay_payment_id) {
          createOrder(response.razorpay_payment_id, 'completed');
        } else {
          setIsProcessing(false);
          setPaymentError('Payment failed. Please try again.');
        }
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          setPaymentError('Payment cancelled');
        }
      },
      prefill: userDetails,
      theme: {
        color: '#007bff'
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsProcessing(false);
        setPaymentError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      setIsProcessing(false);
      setPaymentError('Failed to initialize payment. Please try again.');
    }
  };

  const createOrder = async (paymentId, status) => {
    try {
      const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
      if (!pendingOrder) {
        toast.error('Order details not found');
        navigate('/cart');
        return;
      }

      const orderId = 'ORD' + Date.now();
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/orders/create`,
        {
          orderId,
          items: pendingOrder.items,
          totalAmount: pendingOrder.totalAmount,
          deliveryAddress: pendingOrder.deliveryAddress
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Set final total paid
        setFinalTotalPaid(pendingOrder.totalAmount);
        
        // Store completed breakdown
        const breakdowns = JSON.parse(localStorage.getItem('orderBreakdowns') || '{}');
        breakdowns[orderId] = {
          ...pendingOrder,
          orderId,
          completed: true,
          paymentId,
          paymentMethod: paymentMethod,
          paymentStatus: status,
          finalAmount: pendingOrder.totalAmount
        };
        localStorage.setItem('orderBreakdowns', JSON.stringify(breakdowns));

        // Cleanup
        localStorage.removeItem('pendingOrder');
        clearCart();
        setOrderConfirmed(true);
        setOrderId(orderId);
        toast.success('Order placed successfully!');
      }
    } catch (error) {
      console.error('Error creating order:', error.response?.data || error);
      setPaymentError('Failed to create order. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <ToastContainer />
      {!orderConfirmed ? (
        <>
          <h2>Confirm Your Payment</h2>

          <div className="summary-box">
            <h3>Order Summary</h3>
            {cart.items.map((item, index) => (
              <div key={index} className="summary-item">
                <span>{item.name}</span>
                <span>Qty: {item.quantity}</span>
              </div>
            ))}
            <hr />
            <h4>Total: ₹{totalAmount}</h4>
          </div>

          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <label>
              <input
                type="radio"
                name="payment"
                value="razorpay"
                checked={paymentMethod === 'razorpay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Card/UPI via Razorpay
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Direct UPI (Mock)
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery
            </label>

            {paymentMethod === 'razorpay' && (
              <div className="test-card-details">
                <h4>Test Card Details</h4>
                <div className="card-info">
                  <p>Card Number: {testCardDetails.number}</p>
                  <p>Expiry: {testCardDetails.expiry}</p>
                  <p>CVV: {testCardDetails.cvv}</p>
                  <small>Use these details for testing the payment</small>
                </div>
              </div>
            )}
          </div>

          {paymentError && (
            <div className="payment-error">❌ {paymentError}</div>
          )}

          <button
            onClick={handlePayment}
            className="pay-btn"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Proceed with ${paymentMethod.toUpperCase()}`}
          </button>
        </>
      ) : (
        <>
          <h2>🎉 Order Successful!</h2>
          <div className="invoice-box">
            <h3>Order Info</h3>
            <p><strong>Order ID:</strong> {orderId}</p>
            {cart.items.map((item, index) => (
              <div key={index} className="invoice-item">
                <span>{item.name}</span>
                <span>Qty: {item.quantity}</span>
              </div>
            ))}
            <hr />
            <p><strong>Total Paid:</strong> ₹{finalTotalPaid}</p>
            <p><strong>Payment Method:</strong> {paymentMethod.toUpperCase()}</p>
            <p>📩 Check your email for the invoice.</p>
          </div>
          <button onClick={() => navigate('/')} className="home-btn">
            🏠 Back to Home
          </button>
        </>
      )}
    </div>
  );
};

export default Payment;
