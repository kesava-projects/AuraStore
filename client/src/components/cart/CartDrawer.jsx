import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, items, subtotal, totalItems, updateItemQty, removeItem } =
    useCart();
  const navigate = useNavigate();

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const freeShippingThreshold = 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div
      className="drawer-backdrop"
      onClick={closeDrawer}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
    >
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()} tabIndex={-1}>
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Shopping Cart</h2>
            <span className="badge badge-primary">{totalItems}</span>
          </div>
          <button
            onClick={closeDrawer}
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px' }}
            aria-label="Close cart drawer"
          >
            ✕
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--bg-border)',
          }}
        >
          {amountToFreeShipping > 0 ? (
            <p className="text-xs font-medium">
              Add{' '}
              <strong style={{ color: 'var(--color-primary)' }}>
                ${amountToFreeShipping.toFixed(2)}
              </strong>{' '}
              more for <strong>FREE Shipping</strong>!
            </p>
          ) : (
            <p className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>
              🎉 You unlocked FREE Shipping!
            </p>
          )}
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                Your shopping cart is empty.
              </p>
              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/products');
                }}
                className="btn btn-primary btn-sm"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const pid = item.productId || item._id;
              return (
                <div
                  key={pid}
                  className="flex gap-3"
                  style={{
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--bg-border)',
                  }}
                >
                  <img
                    src={
                      item.image ||
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80'
                    }
                    alt={item.title}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-subtle)',
                    }}
                  />
                  <div
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                  >
                    <div className="flex justify-between items-start">
                      <Link
                        to={`/products/${item.slug}`}
                        onClick={closeDrawer}
                        className="text-sm font-semibold"
                        style={{
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.title}
                      </Link>
                      <button
                        onClick={() => removeItem(pid)}
                        className="btn btn-icon text-muted"
                        style={{ width: '24px', height: '24px', minWidth: '24px' }}
                        aria-label={`Remove ${item.title}`}
                      >
                        ×
                      </button>
                    </div>

                    <span className="text-sm font-bold">${item.price.toFixed(2)}</span>

                    <div className="flex items-center gap-2" style={{ marginTop: 'auto' }}>
                      <div
                        className="flex items-center"
                        style={{
                          border: '1px solid var(--bg-border)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <button
                          onClick={() => updateItemQty(pid, item.quantity - 1)}
                          className="btn btn-sm"
                          style={{ padding: '0.2rem 0.5rem' }}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold" style={{ padding: '0 0.5rem' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemQty(pid, item.quantity + 1)}
                          className="btn btn-sm"
                          style={{ padding: '0.2rem 0.5rem' }}
                          disabled={item.stock && item.quantity >= item.stock}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="text-lg font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted">Taxes and shipping calculated at checkout.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/checkout');
                }}
                className="btn btn-primary w-full"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/cart');
                }}
                className="btn btn-secondary w-full"
              >
                View Full Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
