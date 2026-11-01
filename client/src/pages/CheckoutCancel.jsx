import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export function CheckoutCancel() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div
      className="container"
      style={{ padding: '5rem 1.25rem', maxWidth: '600px', textAlign: 'center' }}
    >
      <div
        className="card"
        style={{
          padding: '3rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold">Checkout Cancelled</h1>
        <p className="text-muted" style={{ lineHeight: 1.6 }}>
          Your payment was not completed and no funds were charged. Your reserved items will be
          released back to inventory.
        </p>

        {orderId && (
          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
            }}
          >
            Order ID: <strong>{orderId}</strong>
          </div>
        )}

        <div
          className="flex gap-4"
          style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
        >
          <Link to="/cart" className="btn btn-primary">
            Return to Cart
          </Link>
          <Link to="/products" className="btn btn-secondary">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
