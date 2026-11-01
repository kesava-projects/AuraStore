import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);
const GUEST_CART_KEY = 'aura_guest_cart';

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Sync cart when auth state changes
  useEffect(() => {
    async function syncCart() {
      setLoading(true);
      if (isAuthenticated) {
        // Check if there was a guest cart to merge
        const savedGuest = localStorage.getItem(GUEST_CART_KEY);
        if (savedGuest) {
          try {
            const guestItems = JSON.parse(savedGuest);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              const formatted = guestItems.map((i) => ({
                productId: i.productId || i._id,
                quantity: i.quantity,
              }));
              const merged = await api.mergeCart(formatted);
              setItems(merged.items || []);
              localStorage.removeItem(GUEST_CART_KEY);
              showToast('Your guest cart items were merged into your account!', 'info');
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('Error merging guest cart:', e);
          }
        }

        // Fetch user cart from server
        try {
          const serverCart = await api.getCart();
          setItems(serverCart.items || []);
        } catch (e) {
          console.error('Failed to load server cart:', e);
        }
      } else {
        // Load guest cart from local storage
        try {
          const saved = localStorage.getItem(GUEST_CART_KEY);
          if (saved) {
            setItems(JSON.parse(saved));
          } else {
            setItems([]);
          }
        } catch {
          setItems([]);
        }
      }
      setLoading(false);
    }

    syncCart();
  }, [isAuthenticated, showToast]);

  // Persist guest cart to localStorage
  const saveGuestCart = (newItems) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));
  };

  // Add Item to cart
  const addItem = async (product, quantity = 1) => {
    const qtyToAdd = Math.max(1, Number(quantity) || 1);
    const productId = product._id || product.productId;

    let updatedItems = [...items];
    const existingIndex = updatedItems.findIndex((i) => (i.productId || i._id) === productId);

    if (existingIndex > -1) {
      const existing = updatedItems[existingIndex];
      const maxStock = product.stock !== undefined ? product.stock : existing.stock;
      const newQty = Math.min(existing.quantity + qtyToAdd, maxStock > 0 ? maxStock : 99);
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
      };
    } else {
      updatedItems.push({
        _id: productId,
        productId,
        title: product.title,
        slug: product.slug,
        price: product.price,
        image: product.images?.[0] || product.image || '',
        stock: product.stock,
        quantity: qtyToAdd,
        priceSnapshot: product.price,
      });
    }

    setItems(updatedItems);
    setIsDrawerOpen(true);
    showToast(`Added "${product.title}" to your cart`, 'success');

    if (isAuthenticated) {
      try {
        const payload = updatedItems.map((i) => ({
          productId: i.productId || i._id,
          quantity: i.quantity,
        }));
        await api.updateCart(payload);
      } catch (err) {
        showToast('Error syncing cart with server: ' + err.message, 'error');
      }
    } else {
      saveGuestCart(updatedItems);
    }
  };

  // Update item quantity
  const updateItemQty = async (productId, newQty) => {
    const qty = Number(newQty);
    if (qty <= 0) {
      return removeItem(productId);
    }

    const updatedItems = items.map((item) => {
      if ((item.productId || item._id) === productId) {
        const capped = item.stock ? Math.min(qty, item.stock) : qty;
        return { ...item, quantity: capped };
      }
      return item;
    });

    setItems(updatedItems);

    if (isAuthenticated) {
      try {
        const payload = updatedItems.map((i) => ({
          productId: i.productId || i._id,
          quantity: i.quantity,
        }));
        await api.updateCart(payload);
      } catch (err) {
        showToast(err.message, 'error');
      }
    } else {
      saveGuestCart(updatedItems);
    }
  };

  // Remove item
  const removeItem = async (productId) => {
    const updatedItems = items.filter((item) => (item.productId || item._id) !== productId);
    setItems(updatedItems);

    if (isAuthenticated) {
      try {
        const payload = updatedItems.map((i) => ({
          productId: i.productId || i._id,
          quantity: i.quantity,
        }));
        await api.updateCart(payload);
      } catch (err) {
        showToast(err.message, 'error');
      }
    } else {
      saveGuestCart(updatedItems);
    }
    showToast('Item removed from cart', 'info');
  };

  // Clear cart
  const clearCart = async () => {
    setItems([]);
    setAppliedCoupon(null);
    if (isAuthenticated) {
      try {
        await api.updateCart([]);
      } catch (err) {
        console.error('Error clearing cart:', err);
      }
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  };

  // Calculations
  const subtotal =
    Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      couponDiscount = Math.round(((subtotal * appliedCoupon.value) / 100) * 100) / 100;
    } else if (appliedCoupon.type === 'fixed') {
      couponDiscount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const shippingFee = discountedSubtotal >= 100 || discountedSubtotal === 0 ? 0 : 10;
  const tax = Math.round(discountedSubtotal * 0.08 * 100) / 100;
  const total = Math.round((discountedSubtotal + shippingFee + tax) * 100) / 100;

  // Apply Coupon
  const applyCoupon = async (code) => {
    if (!code || !code.trim()) return;
    try {
      const res = await api.validateCoupon(code.trim(), subtotal);
      setAppliedCoupon(res.coupon);
      showToast(`Coupon "${res.coupon.code}" applied: -$${res.discount.toFixed(2)}`, 'success');
      return res;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        subtotal,
        totalItems,
        appliedCoupon,
        couponDiscount,
        discountedSubtotal,
        shippingFee,
        tax,
        total,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addItem,
        updateItemQty,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
