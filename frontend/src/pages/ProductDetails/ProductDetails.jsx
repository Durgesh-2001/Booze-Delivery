import React, { useContext, useEffect } from 'react';
import './ProductDetails.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { toast } from 'react-toastify';

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state;
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!product) {
    navigate('/');
    return null;
  }

  const handleAddToCart = () => {
    const itemToAdd = {
      ...product,
      size: '750ml'
    };
    addToCart(itemToAdd);
    toast.success('Added to cart!');
  };

  return (
    <div className="product-details">
      <div className="product-image-section">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-info-section">
        <h1>{product.name}</h1>
        
        <div className="price-container">
          <span className="price-label">Price:</span>
          <div className="product-price">₹{product.price}</div>
        </div>

        <div className="quantity-container">
          <span className="quantity-label">Quantity:</span>
          <p className="bottle-size">750ml</p>
        </div>

        <div className="product-description">
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>

        <div className="product-actions">
          <button
            onClick={handleAddToCart}
            className="add-to-cart-btn"
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
