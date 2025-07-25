import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState(() => {
    const saved = localStorage.getItem('deliveryAddress');
    return saved ? JSON.parse(saved) : { type: 'home', address: '', city: '', state: '', pincode: '' };
  });

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [tax, setTax] = useState(0);
  const platformFee = 5;

  useEffect(() => {
    const fee = Math.floor(Math.random() * 51);
    setDeliveryFee(fee);

    const taxAmount = Math.floor(Math.random() * 10) + 5;
    setTax(taxAmount);
  }, []);

  useEffect(() => {
    localStorage.setItem('deliveryAddress', JSON.stringify(address));
  }, [address]);

  const calculateItemTotal = (item) => {
    return (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);
  };

  const totalQuantity = cart?.items?.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0) || 0;
  const totalAmount = cart?.items?.reduce((acc, item) => acc + calculateItemTotal(item), 0) || 0;

  const grandTotal = totalAmount + deliveryFee + tax + platformFee;

  useEffect(() => {
    localStorage.setItem('cartTotalAmount', grandTotal.toString());
  }, [grandTotal]);

  const clearAddressForm = () => {
    setAddress({ type: 'home', address: '', city: '', state: '', pincode: '' });
    localStorage.removeItem('deliveryAddress');
  };

  const handleCheckout = async () => {
    if (!address.type || !address.address || !address.city || !address.state || !address.pincode) {
      alert('Please fill all address fields');
      return;
    }

    // Store cart data and address for payment
    const cartData = {
      items: cart.items,
      totalAmount: grandTotal,
      subtotal: Number(totalAmount.toFixed(2)),
      deliveryFee: Number(deliveryFee.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      platformFee: Number(platformFee.toFixed(2)),
      deliveryAddress: address,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('pendingOrder', JSON.stringify(cartData));
    clearAddressForm();
    navigate('/payment');
  };

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {!cart?.items?.length ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-items">
            {cart.items.map((item, index) => {
              const imageUrl = item.image?.startsWith('http')
                ? item.image
                : `${import.meta.env.VITE_API_BASE_URL}/uploads/${item.image}`;
              return (
                <div key={item.productId + '-' + index} className="cart-item">
                  <img src={imageUrl} alt={item.name} className="cart-img" />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>750ml</p>
                    <p>Price: ₹{parseFloat(item.price).toFixed(2)}</p>
                    <p>Subtotal: ₹{calculateItemTotal(item).toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.productId, -1)} disabled={item.quantity <= 1}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)}>+</button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="remove-btn">Remove</button>
                </div>
              );
            })}
          </div>

          <div className="address-form">
            <h3>Delivery Information</h3>
            <select value={address.type} onChange={(e) => setAddress({ ...address, type: e.target.value })}>
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>
            <input type="text" placeholder="Address" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} />
            <input type="text" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            <input type="text" placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
            <input type="text" placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <p>Total Items: {totalQuantity}</p>
            <p>Subtotal: ₹{totalAmount.toFixed(2)}</p>
            <p>Delivery Fee: ₹{deliveryFee}</p>
            <p>GST/Tax: ₹{tax}</p>
            <p>Platform Fee: ₹{platformFee}</p>
            <hr />
            <h4>Grand Total: ₹{grandTotal.toFixed(2)}</h4>
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
