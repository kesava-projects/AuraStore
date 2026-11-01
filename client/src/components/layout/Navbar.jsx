import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems, openDrawer } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const wishlistCount = user?.wishlist?.length || 0;

  return (
    <header className="navbar">
      <div className="container nav-content">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span>AuraStore</span>
        </Link>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="nav-search" style={{ display: 'flex' }}>
          <input
            type="search"
            placeholder="Search headphones, jackets, coffee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ borderRadius: 'var(--radius-full)', paddingRight: '2.5rem' }}
            aria-label="Search products"
          />
          <button
            type="submit"
            className="btn btn-icon"
            style={{
              position: 'absolute',
              right: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '32px',
              color: 'var(--text-muted)',
            }}
            aria-label="Submit search"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        {/* Desktop Links & Actions */}
        <div className="nav-actions">
          <Link
            to="/products"
            className="text-sm font-semibold text-muted"
            style={{ padding: '0.5rem' }}
          >
            All Products
          </Link>

          {/* Wishlist Link */}
          {isAuthenticated && (
            <Link
              to="/account?tab=wishlist"
              className="btn btn-icon btn-secondary"
              style={{ position: 'relative' }}
              aria-label="Wishlist"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {wishlistCount > 0 && <span className="cart-badge-count">{wishlistCount}</span>}
            </Link>
          )}

          {/* Cart Drawer Trigger Button */}
          <button
            onClick={openDrawer}
            className="btn btn-icon btn-secondary"
            style={{ position: 'relative' }}
            aria-label={`Open Cart with ${totalItems} items`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalItems > 0 && <span className="cart-badge-count">{totalItems}</span>}
          </button>

          {/* Auth State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin" className="btn btn-sm btn-outline">
                  Admin
                </Link>
              )}
              <Link to="/account" className="btn btn-sm btn-secondary">
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={logout} className="btn btn-sm text-muted" aria-label="Sign out">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-sm btn-primary">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
