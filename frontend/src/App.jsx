import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Login from './components/Login/Login';

// Pages
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import Payment from './pages/Payment/Payment';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Legal from './pages/Legal/Legal';
import AboutUs from './pages/AboutUs/AboutUs';
import Orders from './pages/Orders/Orders';
import Disclaimer from './pages/Disclaimer/Disclaimer';

// Context
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';

const App = () => {
  const [showLogin, setShowLogin] = useState(false); // Define state for showing the login page

  return (
    <AuthProvider>
      <NotificationsProvider>
        <StoreProvider>
          <CartProvider>
            <div className="app">
              <Navbar />
              <main className="main-content">
                {showLogin && <Login setShowLogin={setShowLogin} />}
                <Routes>
                  <Route path="/" element={<Home setShowLogin={setShowLogin} />} />
                  <Route path="/cart" element={<Cart setShowLogin={setShowLogin} />} />
                  <Route path="/payment" element={<Payment setShowLogin={setShowLogin} />} />
                  <Route path="/product-details" element={<ProductDetails setShowLogin={setShowLogin} />} />
                  <Route path="/legal" element={<Legal />} />
                  <Route path="/terms" element={<Legal />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/disclaimer" element={<Disclaimer />} />
                </Routes>
              </main>
              <Footer />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </CartProvider>
        </StoreProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
};

export default App;