import React, { createContext, useContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            const parsedCart = savedCart ? JSON.parse(savedCart) : { items: [] };
            return { items: Array.isArray(parsedCart.items) ? parsedCart.items : [] };
        } catch (error) {
            console.error('Error loading cart:', error);
            return { items: [] };
        }
    });

    const addToCart = (product) => {
        setCart(prevCart => {
            const currentItems = Array.isArray(prevCart?.items) ? prevCart.items : [];
            const existingItem = currentItems.find(item => item?.productId === product?.id);

            if (existingItem) {
                const updatedItems = currentItems.map(item =>
                    item.productId === product.id 
                        ? { ...item, quantity: (item.quantity || 0) + 1 }
                        : item
                );
                const newCart = { items: updatedItems };
                localStorage.setItem('cart', JSON.stringify(newCart));
                return newCart;
            } else {
                const newCart = {
                    items: [...currentItems, {
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1
                    }]
                };
                localStorage.setItem('cart', JSON.stringify(newCart));
                return newCart;
            }
        });
    };

    const updateQuantity = (productId, quantityChange, newSize = null) => {
        setCart(prevCart => {
            const updatedItems = prevCart.items.map(item => {
                if (item.productId === productId) {
                    if (newSize) {
                        // Update size and get new price based on size
                        return { ...item, size: newSize };
                    }
                    const newQuantity = Math.max(1, item.quantity + quantityChange);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
            
            const newCart = { ...prevCart, items: updatedItems };
            localStorage.setItem('cart', JSON.stringify(newCart));
            return newCart;
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => {
            const currentItems = Array.isArray(prevCart?.items) ? prevCart.items : [];
            const newCart = {
                items: currentItems.filter(item => item?.productId !== productId)
            };
            localStorage.setItem('cart', JSON.stringify(newCart));
            return newCart;
        });
    };

    const clearCart = () => {
        setCart({ items: [] });
        localStorage.removeItem('cart');
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
