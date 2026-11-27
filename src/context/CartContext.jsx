import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { showToast } from '../utils/alerts';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load initial cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bizzolution_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // UI state for Cart Drawer / Modal and Quotation Modal
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [quotationSourceItems, setQuotationSourceItems] = useState(null);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('bizzolution_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('[Cart Storage Error]', e);
    }
  }, [cartItems]);

  // Add Product to Cart
  const addToCart = (product, quantity = 1) => {
    if (!product || !product.partNumber) return;

    const mrp = Number(product.mrp) || 1000;
    const disc = Number(product.discountPercentage) || 48;
    const rate = product.wholesalePrice || Math.round(mrp * (1 - disc / 100));
    const qty = Math.max(1, Number(quantity) || 1);

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.partNumber === product.partNumber);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          amount: updated[existingIdx].rate * newQty,
        };
        return updated;
      }

      return [
        ...prev,
        {
          partNumber: product.partNumber,
          name: product.name,
          brand: product.brand || 'General',
          category: product.categoryName || product.category || 'Industrial Spares',
          section: product.section || '',
          image: product.image || '/belts/pix-section-c.jpg',
          mrp,
          discountPercentage: disc,
          rate,
          quantity: qty,
          amount: rate * qty,
          specifications: product.specifications || '',
          hsn: '8482',
        },
      ];
    });

    showToast(`✓ Added ${product.partNumber} (${qty} ${qty > 1 ? 'units' : 'unit'}) to Cart!`);
  };

  // Update Quantity with automatic rate multiplication
  const updateQuantity = (partNumber, newQty) => {
    const qty = Number(newQty);
    setCartItems((prev) => {
      if (qty <= 0) {
        return prev.filter((item) => item.partNumber !== partNumber);
      }
      return prev.map((item) => {
        if (item.partNumber === partNumber) {
          return {
            ...item,
            quantity: qty,
            amount: item.rate * qty, // Quantity increments multiply price in real time
          };
        }
        return item;
      });
    });
  };

  // Remove individual item
  const removeFromCart = (partNumber) => {
    setCartItems((prev) => prev.filter((item) => item.partNumber !== partNumber));
    showToast('Item removed from Cart');
  };

  // Clear all items
  const clearCart = () => {
    setCartItems([]);
  };

  // Open & Close Cart
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Trigger Quotation Generation for either Cart or a specific custom item
  const openQuotationModal = (customItems = null) => {
    setQuotationSourceItems(customItems);
    setIsQuotationModalOpen(true);
  };
  const closeQuotationModal = () => {
    setIsQuotationModalOpen(false);
    setQuotationSourceItems(null);
  };

  // Computed Cart Totals
  const totalItemCount = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
  }, [cartItems]);

  const uniqueItemCount = cartItems.length;

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + (it.amount || 0), 0);
  }, [cartItems]);

  const cartTax = useMemo(() => {
    return Math.round(cartSubtotal * 0.18 * 100) / 100;
  }, [cartSubtotal]);

  const cartGrandTotal = useMemo(() => {
    return Math.round((cartSubtotal + cartTax) * 100) / 100;
  }, [cartSubtotal, cartTax]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemCount,
        uniqueItemCount,
        cartSubtotal,
        cartTax,
        cartGrandTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        isQuotationModalOpen,
        quotationSourceItems,
        openQuotationModal,
        closeQuotationModal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
