import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--bg-border)',
        padding: '3rem 0 2rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <div
              className="flex items-center gap-2"
              style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}
            >
              <svg
                width="24"
                height="24"
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
              <span className="font-bold text-lg">AuraStore</span>
            </div>
            <p className="text-sm text-muted">
              Premium MERN full-stack e-commerce experience. Built with atomic stock reservations,
              verified server pricing, and Stripe payments.
            </p>
          </div>

          <div>
            <h4
              className="text-sm font-bold"
              style={{ marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Shop
            </h4>
            <div className="flex flex-col gap-2 text-sm text-muted">
              <Link to="/products">All Products</Link>
              <Link to="/products?category=electronics">Electronics</Link>
              <Link to="/products?category=clothing">Clothing & Apparel</Link>
              <Link to="/products?category=home-kitchen">Home & Kitchen</Link>
            </div>
          </div>

          <div>
            <h4
              className="text-sm font-bold"
              style={{ marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Customer Care
            </h4>
            <div className="flex flex-col gap-2 text-sm text-muted">
              <Link to="/account">My Account</Link>
              <Link to="/account?tab=orders">Order History & Tracking</Link>
              <Link to="/account?tab=addresses">Shipping Addresses</Link>
              <Link to="/cart">Cart Summary</Link>
            </div>
          </div>

          <div>
            <h4
              className="text-sm font-bold"
              style={{ marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Test Credentials
            </h4>
            <p className="text-xs text-muted" style={{ lineHeight: 1.6 }}>
              <strong>Admin:</strong> admin@example.com
              <br />
              <strong>Customer:</strong> alice@example.com
              <br />
              <strong>Password:</strong> Password123!
              <br />
              <strong>Coupons:</strong> WELCOME10, SAVE20
            </p>
          </div>
        </div>

        <div
          className="flex justify-between items-center text-xs text-muted"
          style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--bg-border)' }}
        >
          <span>© {new Date().getFullYear()} AuraStore Inc. All rights reserved.</span>
          <span>Secured with Stripe & JWT</span>
        </div>
      </div>
    </footer>
  );
}
