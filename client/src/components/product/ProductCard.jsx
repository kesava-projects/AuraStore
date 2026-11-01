import React from 'react';
import { Link } from 'react-router-dom';
import { RatingStars } from '../common/RatingStars.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggleWishlist, isItemInWishlist } = useAuth();
  const inWishlist = isItemInWishlist(product._id);

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/products/${product.slug}`} tabIndex={-1} aria-hidden="true">
          <img
            src={
              product.images?.[0] ||
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'
            }
            alt={product.title}
            loading="lazy"
          />
        </Link>

        <button
          onClick={() => toggleWishlist(product._id)}
          className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={inWishlist ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>

        {discountPercent && (
          <span
            className="badge badge-danger"
            style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}
          >
            -{discountPercent}%
          </span>
        )}
      </div>

      <div className="product-card-body">
        {product.categoryId?.name && (
          <span className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>
            {product.categoryId.name}
          </span>
        )}

        <Link to={`/products/${product.slug}`}>
          <h3 className="product-card-title">{product.title}</h3>
        </Link>

        <div style={{ margin: '0.25rem 0 0.75rem' }}>
          <RatingStars rating={product.ratingAvg} count={product.ratingCount} size={14} />
        </div>

        <div className="flex items-center justify-between" style={{ marginTop: 'auto' }}>
          <div className="flex items-baseline">
            <span className="product-card-price">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="compare-price">${product.compareAtPrice.toFixed(2)}</span>
            )}
          </div>

          {isOutOfStock ? (
            <span className="badge badge-warning">Out of stock</span>
          ) : (
            <button
              onClick={() => addItem(product, 1)}
              className="btn btn-primary btn-sm"
              aria-label={`Add ${product.title} to cart`}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
