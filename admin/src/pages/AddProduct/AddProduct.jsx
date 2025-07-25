import React, { useState } from 'react';
import './AddProduct.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddProduct = () => {
  const url = `${import.meta.env.VITE_API_BASE_URL}`;
  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    features: [],
    inStock: true
  });

  const onChangeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('name', data.name);
      formData.append('price', data.price);
      formData.append('category', data.category);
      formData.append('description', data.description);
      formData.append('inStock', data.inStock);

      const response = await axios.post(`${url}/api/products/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setData({
          name: '',
          price: '',
          category: '',
          description: '',
          features: [],
          inStock: true
        });
        setImage(null);
        toast.success('Product added successfully!');
      } else {
        toast.error(response.data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Error adding product');
    }
  };

  return (
    <div className="add-product">
      <form className="form" onSubmit={onSubmitHandler}>
        <div className="image-upload">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="Upload" />
          </label>
          <input 
            onChange={(e) => setImage(e.target.files[0])} 
            type="file" 
            id="image" 
            hidden 
            required 
          />
        </div>

        <div className="input-group">
          <label htmlFor="name">Product Name</label>
          <input
            id="name"
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="input-group">
          <label>Category</label>
          <div className="category-options">
            {['Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Brandy', 'Beer', 'Wine'].map((category) => (
              <label key={category}>
                <input
                  type="radio"
                  name="category"
                  value={category}
                  onChange={onChangeHandler}
                  checked={data.category === category}
                  required
                />
                {category}
              </label>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="price">Price (₹)</label>
          <input
            id="price"
            onChange={onChangeHandler}
            value={data.price}
            type="text"
            name="price"
            placeholder="Enter product price"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="4"
            placeholder="Enter product description"
            required
          />
        </div>

        <div className="stock-status">
          <label>
            <input
              type="checkbox"
              name="inStock"
              checked={data.inStock}
              onChange={(e) => setData({ ...data, inStock: e.target.checked })}
            />
            In Stock
          </label>
        </div>

        <button type="submit" className="submit-btn">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;
