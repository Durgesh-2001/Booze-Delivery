import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assets } from '../../assets/assets.js'
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = () => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="admin-navbar">
      <Link to="/admin/dashboard" className="navbar-logo">
        <img src={assets.logo} alt="EyeWorld Admin" />
      </Link>
      <div className="admin-nav-right">
        {user && (
          <>
            <span className="admin-user">Admin: {user.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
