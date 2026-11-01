import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const simulated = searchParams.get('simulated');
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear local cart state upon reaching success page
    clearCart();

    // If simulated checkout in development mode, fire the mock webhook event so the order is marked paid
    if (simulated && orderId && sessionId) {
      fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: sessionId,
              payment_intent: `pi_simulated_${Date.now()}`,
              metadata: { orderId },
            },
          },
        }),
      }).catch((e) => console.log('Mock webhook triggered:', e));
    }
  }, [simulated, orderId, sessionId]);

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
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold">Payment Confirmed!</h1>
        <p className="text-muted" style={{ lineHeight: 1.6 }}>
          Thank you for your order. We have received your payment via Stripe and our fulfillment
          center is preparing your shipment.
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
            Order Reference: <strong style={{ color: 'var(--color-primary)' }}>{orderId}</strong>
          </div>
        )}

        <div
          className="flex gap-4"
          style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
        >
          <Link to="/account?tab=orders" className="btn btn-primary">
            View Order Status
          </Link>
          <Link to="/products" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
