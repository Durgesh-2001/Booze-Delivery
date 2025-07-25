import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import AddProduct from './pages/AddProduct/AddProduct';
import ListProducts from './pages/ListProducts/ListProducts';
import EditProduct from './pages/EditProduct/EditProduct';
import Orders from './pages/Orders/Orders';
import Login from './pages/Login/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();

  if (!token) {
    return <Navigate to="/admin/login" />;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/admin/login" state={{ error: 'Admin access required' }} />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/*" element={<Navigate to="/admin/login" />} />
      </Routes>
    );
  }

  return (
    <div>
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/products/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><ListProducts /></ProtectedRoute>} />

          {/* ✅ BOTH edit routes added */}
          <Route path="/admin/products/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
          <Route path="/admin/products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />

          <Route path="/admin/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

          {/* Catch-all — leave this at the bottom */}
          <Route path="/admin/*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ToastContainer />
      <AppContent />
    </AuthProvider>
  );
};

export default App;