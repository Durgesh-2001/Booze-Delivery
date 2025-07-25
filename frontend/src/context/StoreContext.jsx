import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/list`);
        if (response.data.success) {
          const formattedProducts = response.data.data.map(product => ({
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            image: `${import.meta.env.VITE_API_BASE_URL}/images/${product.image}`,
            description: product.description,
            inStock: product.inStock
          }));
          setProductList(formattedProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const value = {
    productList,
    loading,
    error,
    searchResults,
    setSearchResults,
    filters,
    setFilters
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
