import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Configure axios
  const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,  // Add /api prefix
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const fetchNotifications = async () => {
    if (!userId || !token) return;
    
    try {
      const { data } = await api.get(`/notifications/${userId}`);
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { data } = await api.put(`/notifications/${notificationId}/read`);
      if (data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data } = await api.put(`/notifications/${userId}/read-all`);
      if (data.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    if (userId && token) {
      fetchNotifications();
      const pollInterval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
      return () => clearInterval(pollInterval);
    }
  }, [userId, token]);

  const value = {
    notifications,
    setNotifications,  // Make sure this is included
    unreadCount,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationsContext);
};
