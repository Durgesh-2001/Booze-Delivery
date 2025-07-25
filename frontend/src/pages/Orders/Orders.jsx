import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Orders.css';
import OrderStatus from '../../components/OrderStatus/OrderStatus';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBreakdowns, setExpandedBreakdowns] = useState({}); // Tracks which orders' breakdown is shown

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/orders/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBreakdown = (orderId) => {
    setExpandedBreakdowns((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getBreakdownForOrder = (orderId) => {
    try {
      const breakdowns = JSON.parse(localStorage.getItem('orderBreakdowns') || '{}');
      const breakdown = breakdowns[orderId];
      
      if (breakdown && breakdown.completed) {
        return breakdown;
      }
      return null;
    } catch (error) {
      console.error('Error getting breakdown:', error);
      return null;
    }
  };

  const renderBreakdown = (order, isExpanded) => {
    if (!isExpanded) return null;

    const breakdown = getBreakdownForOrder(order.orderId);
    
    if (!breakdown || !breakdown.subtotal) {
      return (
        <div className="price-breakdown">
          <p className="no-breakdown">
            Order details will be available after payment
          </p>
        </div>
      );
    }

    // Only price breakdown, no payment info
    const subtotal = Number(breakdown.subtotal) || 0;
    const deliveryFee = Number(breakdown.deliveryFee) || 0;
    const tax = Number(breakdown.tax) || 0;
    const platformFee = Number(breakdown.platformFee) || 0;
    const grandTotal = subtotal + deliveryFee + tax + platformFee;

    return (
      <div className="price-breakdown">
        <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
        <p>Delivery Fee: ₹{deliveryFee.toFixed(2)}</p>
        <p>Tax: ₹{tax.toFixed(2)}</p>
        <p>Platform Fee: ₹{platformFee.toFixed(2)}</p>
        <hr />
        <p><strong>Grand Total: ₹{grandTotal.toFixed(2)}</strong></p>
      </div>
    );
  };

  if (loading) {
    return <div className="orders-loading">Loading orders...</div>;
  }

  return (
    <div className="orders-page">
      <h1>Your Orders</h1>
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order, orderIndex) => {
            return (
              <div key={`order-${order.orderId}-${orderIndex}`} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.orderId}</h3>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item, itemIndex) => {
                    const imageUrl = item.image?.startsWith('http')
                      ? item.image
                      : `${import.meta.env.VITE_API_BASE_URL}/uploads/${item.image}`;
                    return (
                      <div key={`order-${order.orderId}-item-${itemIndex}`} className="order-item">
                        {item.image && (
                          <img src={imageUrl} alt={item.name} className="order-item-img" />
                        )}
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p>Quantity: {item.quantity}</p>
                          <p>₹{item.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <OrderStatus orderId={order.orderId} initialStatus={order.status} />

                <div className="order-footer">
                  <div className="order-footer-content">
                    <div className="payment-info">
                      {(() => {
                        const breakdown = getBreakdownForOrder(order.orderId);
                        if (breakdown?.paymentMethod) {
                          return (
                            <>
                              <h4>Payment Details:</h4>
                              <p><strong>Method:</strong> {breakdown.paymentMethod.toUpperCase()}</p>
                              <p><strong>ID:</strong> {breakdown.paymentId || 'N/A'}</p>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="order-total">
                      <h4
                        className="order-total-clickable"
                        onClick={() => toggleBreakdown(order.orderId)}
                      >
                        Total: ₹{order.totalAmount}
                        <span className="toggle-icon">
                          {expandedBreakdowns[order.orderId] ? '👇🏻' : '👇🏻'} 
                        </span>
                      </h4>
                      {renderBreakdown(order, expandedBreakdowns[order.orderId])}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
