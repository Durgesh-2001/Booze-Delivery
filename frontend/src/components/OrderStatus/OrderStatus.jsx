import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderStatus.css';
import { useAuth } from '../../context/AuthContext';
import { FaBox, FaIndustry, FaMotorcycle, FaTruck, FaHome } from 'react-icons/fa';

const ETA_DURATION_MINUTES = 6;

const OrderStatus = ({ orderId, initialStatus }) => {
  const { token } = useAuth();
  const [status, setStatus] = useState(initialStatus);
  const [etaEndTime, setEtaEndTime] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [currentStage, setCurrentStage] = useState('');
  const [showDeliveryCompleteMessage, setShowDeliveryCompleteMessage] = useState(false);

  const statusSteps = [
    'Order Placed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  const deliveryStagesList = [
    'Delivery partner assigned to your order 👤',
    'partner on the way to pick up your order 🚗',
    'partner reached the warehouse 🏢',
    'Order picked up from warehouse 🏢',
    'Arriving in 3 mins⚡',
    'Partner on the way to destination 🚚',
    'Partner has arrived at your location 📍',
    'Partner is at your doorstep! 🏠',
    'Order delivered!🎉'
  ];

  const getCurrentStepIndex = () => statusSteps.indexOf(status);

  useEffect(() => {
    const storedEta = localStorage.getItem(`eta-${orderId}`);
    if (storedEta) {
      setEtaEndTime(new Date(storedEta));
    }
  }, [orderId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!etaEndTime) return setCountdown('');

      const now = new Date();
      const diff = etaEndTime - now;

      if (diff <= 0) {
        setCountdown('00:00');
        clearInterval(interval);
        if (status !== 'Delivered') {
          setShowDeliveryCompleteMessage(true);
        }
      } else {
        const mins = Math.floor(diff / 1000 / 60);
        const secs = Math.floor((diff / 1000) % 60);
        setCountdown(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);

        const stageIndex = Math.floor((ETA_DURATION_MINUTES * 60 - diff / 1000) / (ETA_DURATION_MINUTES * 60 / deliveryStagesList.length));
        if (stageIndex < deliveryStagesList.length) {
          setCurrentStage(deliveryStagesList[stageIndex]);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [etaEndTime, status]);

  const fetchOrderStatus = async () => {
    if (!token) return console.error("No auth token. User must be logged in.");

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/orders/status/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const newStatus = res.data.status;
        setStatus(newStatus);

        if (newStatus === 'Out for Delivery') {
          const storedEta = localStorage.getItem(`eta-${orderId}`);
          if (!storedEta) {
            const newEta = new Date(Date.now() + ETA_DURATION_MINUTES * 60 * 1000);
            setEtaEndTime(newEta);
            localStorage.setItem(`eta-${orderId}`, newEta.toISOString());
          } else {
            setEtaEndTime(new Date(storedEta));
          }
        }

        if (newStatus === 'Delivered') {
          setEtaEndTime(null);
          localStorage.removeItem(`eta-${orderId}`);
        }
      } else {
        console.error("Error fetching status:", res.data.message);
      }
    } catch (err) {
      console.error("Error fetching order status:", err);
    }
  };

  const cancelOrder = async () => {
    if (status === 'Shipped' || status === 'Out for Delivery' || status === 'Delivered') {
      console.error("Cannot cancel the order as it is already shipped, out for delivery, or delivered.");
      return;
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/cancel`,
        { status: 'Cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setStatus('Cancelled');
      } else {
        console.error('Error cancelling order:', res.data.message);
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
    const intervalId = setInterval(fetchOrderStatus, 60000);
    return () => clearInterval(intervalId);
  }, [orderId, token]);

  return (
    <div className="order-status">
      {status !== 'Cancelled' ? (
        <>
          <div className="status-text">
            <strong>Status:</strong> {status}
            {etaEndTime && status !== 'Delivered' && (
              <div className="countdown">ETA: <span>{countdown}</span></div>
            )}
          </div>

          <div className="status-bar">
            {statusSteps.map((step, index) => {
              const currentIndex = getCurrentStepIndex();
              const isCompleted = index < currentIndex;
              const isActive = index === currentIndex;
              const shouldAnimate = isActive && status !== 'Delivered';

              const getAnimationClass = () => {
                if (!shouldAnimate) return '';
                if (step === 'Shipped' || step === 'Out for Delivery') return 'move-forward pop';
                if (step === 'Order Placed' || step === 'Processing') return 'bounce pop';
                return '';
              };

              return (
                <React.Fragment key={step}>
                  <div 
                    className={`status-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                    data-status={step}
                  >
                    <div className={`step-icon ${getAnimationClass()}`}>
                      {step === 'Order Placed' && <FaBox />}
                      {step === 'Processing' && <FaIndustry />}
                      {step === 'Shipped' && <FaTruck />}
                      {step === 'Out for Delivery' && <FaMotorcycle />}
                      {step === 'Delivered' && <FaHome />}
                    </div>
                    <span className="step-label">{step}</span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`status-line ${isCompleted ? 'completed' : ''}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {status === 'Out for Delivery' && (
            <div className="fake-map">
              <h4>Delivery Stage:</h4>
              <div className="stage-container">
                <p className="animated-stage">{currentStage}</p>
              </div>
            </div>
          )}

          {/* Cancel Order button is only visible if the order isn't shipped, out for delivery, or delivered */}
          {status !== 'Shipped' && status !== 'Out for Delivery' && status !== 'Delivered' && (
            <button onClick={cancelOrder} className="cancel-order-btn">
              Cancel Order
            </button>
          )}

          {showDeliveryCompleteMessage && status !== 'Delivered' && (
            <div className="delivery-complete-message">
              <p><strong>Delivery Complete!</strong></p>
              <p>Please refresh the page to verify the updated order status.</p>
            </div>
          )}
        </>
      ) : (
        <div className="order-cancelled-message">
          <p>Your order has been cancelled.</p>
          <p>If you have any order related or Refund related queries, please contact support.</p>
        </div>
      )}
    </div>
  );
};

export default OrderStatus;