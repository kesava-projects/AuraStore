import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export function CartPage() {
  const {
    items,
    subtotal,
    totalItems,
    appliedCoupon,
    couponDiscount,
    shippingFee,
    tax,
    total,
    updateItemQty,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch {
      // toast shown in context
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem 5rem' }}>
        <EmptyState
          title="Your Cart is Empty"
          description="Looks like you have not added any items to your shopping cart yet."
          actionText="Browse Catalog"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 5rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-sm text-muted">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>
        <button onClick={clearCart} className="btn btn-sm text-muted">
          Clear Cart
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Cart Items Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const pid = item.productId || item._id;
                  const itemSubtotal = item.price * item.quantity;
                  return (
                    <tr key={pid}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.image ||
                              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'
                            }
                            alt={item.title}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          />
                          <div>
                            <Link
                              to={`/products/${item.slug}`}
                              className="font-semibold text-sm hover-underline"
                            >
                              {item.title}
                            </Link>
                          </div>
                        </div>
                      </td>

                      <td className="font-semibold text-sm">${item.price.toFixed(2)}</td>

                      <td>
                        <div
                          className="flex items-center"
                          style={{
                            border: '1px solid var(--bg-border)',
                            borderRadius: 'var(--radius-sm)',
                            width: 'fit-content',
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
                      </td>

                      <td className="font-bold text-sm">${itemSubtotal.toFixed(2)}</td>

                      <td>
                        <button
                          onClick={() => removeItem(pid)}
                          className="btn btn-icon text-muted"
                          style={{ width: '28px', height: '28px' }}
                          aria-label={`Remove ${item.title}`}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="flex flex-col gap-4">
          <div className="card">
            <h2 className="text-xl font-bold" style={{ marginBottom: '1.25rem' }}>
              Order Summary
            </h2>

            {/* Price lines */}
            <div
              className="flex flex-col gap-3 text-sm"
              style={{ borderBottom: '1px solid var(--bg-border)', paddingBottom: '1.25rem' }}
            >
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between" style={{ color: 'var(--color-success)' }}>
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span className="font-semibold">-${couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted">Estimated Shipping</span>
                <span className="font-semibold">
                  {shippingFee === 0 ? (
                    <span className="badge badge-success">FREE</span>
                  ) : (
                    `$${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted">Estimated Sales Tax (8%)</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline" style={{ margin: '1.25rem 0' }}>
              <span className="text-base font-bold">Total</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                ${total.toFixed(2)}
              </span>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn btn-primary btn-lg w-full">
              Proceed to Checkout
            </button>
          </div>

          {/* Coupon Code Section */}
          <div className="card">
            <h3 className="font-bold text-sm" style={{ marginBottom: '0.75rem' }}>
              Have a Promo Code?
            </h3>
            {appliedCoupon ? (
              <div
                className="flex justify-between items-center"
                style={{
                  backgroundColor: 'var(--color-success-bg)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span className="text-xs font-bold" style={{ color: 'var(--color-success)' }}>
                  ✓ {appliedCoupon.code} applied (-${couponDiscount.toFixed(2)})
                </span>
                <button
                  onClick={removeCoupon}
                  className="btn btn-sm text-muted"
                  style={{ fontSize: '0.75rem', padding: 0 }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10, SAVE20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="input"
                  style={{ textTransform: 'uppercase' }}
                  aria-label="Coupon code input"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="btn btn-secondary"
                >
                  Apply
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
