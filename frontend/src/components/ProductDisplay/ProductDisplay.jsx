import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProductDisplay.css'
import { StoreContext } from '../../context/StoreContext'

const ProductItem = ({ 
  id, 
  name, 
  image, 
  category, 
  price,
  description,
  inStock,
  setShowLogin,
  hidePrice = false 
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setShowLogin(true)
      return
    }
    window.scrollTo(0, 0);
    navigate('/product-details', { 
      state: { 
        id, 
        name, 
        image, 
        category, 
        price,
        description,
        inStock
      }
    })
  }

  return (
    <div className='product-item' id={id} onClick={handleClick}>
      <div className='product-ribbon'>{category}</div>
      <img className='product-image' src={image} alt={name} />
      <div className='product-info'>
        <div className='product-header'>
          <h3 className='product-name'>{name}</h3>
          {!hidePrice && <div className='product-badge'>{inStock ? '🔥' : '💤'}</div>}
        </div>
        {!hidePrice && <p className='product-price'>₹{price}</p>}
        {!hidePrice && (
          <span className={`stock-status ${!inStock ? 'out-of-stock' : ''}`}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        )}
      </div>
    </div>
  )
}

const ProductDisplay = ({ category, setShowLogin }) => {
  const { productList } = useContext(StoreContext)

  return (
    <div className='product-display' id='product-display'>
      <h2>Popular Drinks For YOU!!!</h2>
      <div className="product-display-list">
        {!productList ? (
          <div className="loading-placeholder">Loading popular drinks...</div>
        ) : (
          productList.map((item) => {
            if (category === 'All' || category === item.category) {
              return (
                <ProductItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  category={item.category}
                  inStock={item.inStock}
                  setShowLogin={setShowLogin}
                />
              )
            }
            return null
          })
        )}
      </div>
    </div>
  )
}

export { ProductItem }
export default ProductDisplay
