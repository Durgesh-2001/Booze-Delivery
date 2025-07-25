import React from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets.js';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `sidebar-option ${isActive ? 'active' : ''}`
          }
          end  // Ensures the link is only active for the exact match
        >
          <img src={assets.home_icon} alt="" />
          <p>Dashboard</p>
        </NavLink>

        <NavLink
          to="/admin/products/add"
          className={({ isActive }) =>
            `sidebar-option ${isActive ? 'active' : ''}`
          }
          end  // Ensures the link is only active for the exact match
        >
          <img src={assets.add_icon} alt="" />
          <p>Add Product</p>
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `sidebar-option ${isActive ? 'active' : ''}`
          }
          end  // Ensures the link is only active for the exact match
        >
          <img src={assets.order_icon} alt="" />
          <p>List Products</p>
        </NavLink>

        <NavLink
          to="/admin/products/edit"
          className={({ isActive }) =>
            `sidebar-option ${isActive ? 'active' : ''}`
          }
          end  // Ensures the link is only active for the exact match
        >
          <img src={assets.pencil_icon} alt="" />
          <p>Edit Product</p>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `sidebar-option ${isActive ? 'active' : ''}`
          }
          end  // Ensures the link is only active for the exact match
        >
          <img src={assets.request_icon} alt="" />
          <p>Orders</p>
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
