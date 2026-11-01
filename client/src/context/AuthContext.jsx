import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setUser(data.user);
    showToast(`Welcome back, ${data.user.name}!`, 'success');
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await api.register({ name, email, password });
    setUser(data.user);
    showToast(`Account created successfully! Welcome, ${data.user.name}.`, 'success');
    return data.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      showToast('Please sign in to save items to your wishlist.', 'info');
      return false;
    }

    try {
      const data = await api.toggleWishlist(productId);
      setUser((prev) => {
        if (!prev) return prev;
        const exists = prev.wishlist?.some((item) => (item._id || item) === productId);
        let updatedWishlist;
        if (exists) {
          updatedWishlist = prev.wishlist.filter((item) => (item._id || item) !== productId);
        } else {
          updatedWishlist = [...(prev.wishlist || []), { _id: productId }];
        }
        return { ...prev, wishlist: updatedWishlist };
      });
      showToast(data.message, 'success');
      return data.inWishlist;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const isItemInWishlist = (productId) => {
    if (!user || !user.wishlist) return false;
    return user.wishlist.some((item) => (item._id || item) === productId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        fetchCurrentUser,
        toggleWishlist,
        isItemInWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
