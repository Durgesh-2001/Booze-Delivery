import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { token, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchStats();
    }
  }, [token, isAuthenticated]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStats(response.data.stats);
        setError(null);
      }
    } catch (err) {
      console.error('Dashboard Error:', err);
      if (err.response?.status === 403) {
        setError('Admin access required. Please log in again.');
      } else {
        setError('Failed to fetch dashboard data. Please try logging in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Order Placed': '#FFC107',
      'Processing': '#2196F3',
      'Shipped': '#FF9800',
      'Out for Delivery': '#9C27B0',
      'Delivered': '#4CAF50'
    };
    return colors[status] || '#757575';
  };

  if (loading) return <div className="dashboard__loading">Loading dashboard data...</div>;

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Admin Dashboard</h1>
      {error && <p className="dashboard__error">{error}</p>}

      <div className="dashboard__stats">
        <div className="stat-item users">
          <h2 className="stat-item__title">Total Users 👤</h2>
          <p className="stat-item__count">{stats.users}</p>
        </div>
        <div className="stat-item products">
          <h2 className="stat-item__title">Total Products 📜</h2>
          <p className="stat-item__count">{stats.products}</p>
        </div>
        <div className="stat-item orders">
          <h2 className="stat-item__title">Total Orders 📦</h2>
          <p className="stat-item__count">{stats.orders}</p>
        </div>
        <div className={`stat-item ${stats.pendingOrders > 0 ? 'pending' : ''}`}>
          <h2 className="stat-item__title">Pending Orders ⏳</h2>
          <p className="stat-item__count">{stats.pendingOrders}</p>
        </div>
        <div className={`stat-item ${stats.deliveredOrders > 0 ? 'delivered' : ''}`}>
          <h2 className="stat-item__title">Delivered Orders🎉</h2>
          <p className="stat-item__count">{stats.deliveredOrders}</p>
        </div>
        <div className="stat-item revenue highlight-revenue">
          <h2 className="stat-item__title">Total Revenue 🤑</h2>
          <p className="stat-item__count">₹ {(stats.revenue ?? 0).toLocaleString()}💸</p>
        </div>
      </div>
      <div className="dashboard__details">
        <div className="recent-orders">
          <h2>Recent Orders</h2>
          {stats.recentOrders?.length > 0 ? (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id || Math.random()}>
                    <td data-label="Order ID">#{order._id?.slice(-6) || '------'}</td>
                    <td data-label="Customer">{order.userId?.name ?? 'Unknown'}</td>
                    <td data-label="Amount">₹{order.totalAmount ?? 0}</td>
                    <td data-label="Status">
                      <span
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status ?? 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent orders</p>
          )}
        </div>

        <div className="top-products">
          <h2>Top Selling Products</h2>
          {stats.topProducts?.length > 0 ? (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td data-label="Rank">#{index + 1}</td>
                    <td data-label="Product">{product.name ?? 'Unnamed Product'}</td>
                    <td data-label="Units Sold">{product.quantity ?? 0}</td>
                    <td data-label="Revenue">₹{(product.revenue ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No top products data</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;