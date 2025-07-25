import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Orders.css';
import OrderStatus from '../../components/OrderStatus/OrderStatus';
import { useAuth } from '../../context/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');

  const statusOptions = [
    'Order Placed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {

      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/orders/${orderId}/status`,
        { 
          status: newStatus,
          note: `Status updated to ${newStatus} by admin`
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.orderId === orderId
              ? { ...order, status: newStatus }
              : order
          )
        );
        toast.success(`#${orderId} status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  if (loading) {
    return <div className="orders-loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <h1>Order Management</h1>
        <div className="filter-section">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Orders</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">No orders found</div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="order-header">
                <h3>Order #{order.orderId}</h3>
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="customer-info">
                <p><strong>Customer ID:</strong> {order.userId ? order.userId._id : 'N/A'}</p>
                <p><strong>Customer Name:</strong> {order.userId?.name || 'N/A'}</p>
              </div>

              {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                <div className="delivery-address">
                  <h4>Delivery Address:</h4>
                  {order.deliveryAddress ? (
                    <>
                      <p><strong>Type:</strong> {order.deliveryAddress.type}</p>
                      <p>{order.deliveryAddress.address}</p>
                      <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                      <p>PIN: {order.deliveryAddress.pincode}</p>
                    </>
                  ) : (
                    <p>No delivery address available</p>
                  )}
                </div>
              )}

              <div className="order-items">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    item && item._id ? (
                      <div key={item._id} className="order-item">
                        <img src={item.image} alt={item.name} />
                        <div className="item-details">
                          <p className="item-name">{item.name}</p>
                          <p className="item-size">Size: 750ml</p>
                          <p className="item-quantity">Qty: {item.quantity}</p>
                          <p className="item-price">₹{item.price}</p>
                        </div>
                      </div>
                    ) : (
                      <div key={`${order.orderId}-${item.name}`} className="order-item">
                        {/* Fallback content */}
                      </div>
                    )
                  ))
                ) : (
                  <div className="no-items">No items in this order</div>
                )}
              </div>

              <div className="order-status-section">
                {/* If order is canceled, show message */}
                {order.status === 'Cancelled' ? (
                  <div className="canceled-message">
                    <strong>This order has been canceled by the user.</strong>
                  </div>
                ) : (
                  <OrderStatus
                    orderId={order.orderId}
                    currentStatus={order.status}
                    onStatusUpdate={(newStatus) => updateOrderStatus(order.orderId, newStatus)}
                    isAdmin={true}
                    disabledStatuses={['Cancelled']} // Disable status change if canceled
                  />
                )}
              </div>

              <div className="order-footer">
                <div className="payment-details">
                  {(() => {
                    const breakdowns = JSON.parse(localStorage.getItem('orderBreakdowns') || '{}');
                    const payment = breakdowns[order.orderId];
                    return payment ? (
                      <>
                        <p><strong>Payment Method:</strong> {payment.paymentMethod}</p>
                        <p><strong>Payment ID:</strong> {payment.paymentId || 'N/A'}</p>
                      </>
                    ) : null;
                  })()}
                </div>
                <p className="total-amount">
                  <strong>Total Amount:</strong> ₹{order.totalAmount}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
