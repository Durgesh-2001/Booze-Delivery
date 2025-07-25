import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('adminUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/validate`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.data.success || !response.data.user?.isAdmin) {
          throw new Error('Not an admin user');
        }

        setUser(response.data.user);
      } catch (error) {
        console.error('Token validation error:', error);
        
        // Avoid toast stacking by checking if we're already on the login page
        const alreadyOnLogin = location.pathname === '/admin/login';
        logout(false); // pass false to skip navigation
        if (!alreadyOnLogin) {
          navigate('/admin/login', {
            state: { error: 'Session expired or invalid admin access. Please login again.' }
          });
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, navigate, location]);

  const login = async (newToken, userData) => {
    try {
      if (!userData.isAdmin) {
        throw new Error('Unauthorized: Not an admin user');
      }

      localStorage.setItem('adminToken', newToken);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = (shouldNavigate = true) => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setUser(null);
    if (shouldNavigate) {
      navigate('/admin/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      logout,
      isAuthenticated: !!token && !!user?.isAdmin,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
