import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { ProductSkeletonGrid } from '../components/common/LoadingSkeleton.jsx';

export function Home() {
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catsRes, newRes, bestRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ sort: 'newest', limit: 4 }),
          api.getProducts({ sort: 'rating', limit: 4 }),
        ]);
        setCategories(catsRes.categories || []);
        setNewArrivals(newRes.products || []);
        setBestSellers(bestRes.products || []);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="flex flex-col gap-8" style={{ paddingBottom: '4rem' }}>
      {/* Hero Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          color: '#ffffff',
          padding: '5rem 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '640px' }}>
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                marginBottom: '1rem',
                backdropFilter: 'blur(4px)',
              }}
            >
              ✨ Explore Curated Collections
            </span>
            <h1
              className="text-3xl font-bold"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: 1.15,
                marginBottom: '1.25rem',
              }}
            >
              Engineered for Style, Crafted for Quality.
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                color: 'rgba(255, 255, 255, 0.85)',
                marginBottom: '2rem',
                lineHeight: 1.6,
              }}
            >
              Discover high-performance electronics, organic apparel, artisanal kitchenware, and
              outdoor essentials with fast checkout and guaranteed stock.
            </p>
            <div className="flex gap-4">
              <Link
                to="/products"
                className="btn btn-lg btn-primary"
                style={{ backgroundColor: '#ffffff', color: '#312e81' }}
              >
                Shop All Products
              </Link>
              <Link
                to="/products?category=electronics"
                className="btn btn-lg btn-outline"
                style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#ffffff' }}
              >
                Explore Electronics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            padding: '2rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold">Free Shipping over $100</h4>
              <p className="text-xs text-muted">Automatic free delivery across USA</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold">Atomic Stock Guarantee</h4>
              <p className="text-xs text-muted">Zero overselling with real-time reservation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warning-bg)',
                color: 'var(--color-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold">Stripe Secured Payments</h4>
              <p className="text-xs text-muted">End-to-end encrypted checkout</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container">
        <div className="flex justify-between items-end" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <p className="text-sm text-muted">Browse top-rated items curated for you</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            View All Categories →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="card flex flex-col items-center justify-center text-center"
              style={{
                padding: '1.75rem 1rem',
                textDecoration: 'none',
                transition: 'var(--transition)',
              }}
            >
              <span className="text-base font-bold" style={{ marginBottom: '0.25rem' }}>
                {cat.name}
              </span>
              <span className="text-xs text-muted">Explore items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container">
        <div className="flex justify-between items-end" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <p className="text-sm text-muted">Freshly added inventory</p>
          </div>
          <Link
            to="/products?sort=newest"
            className="text-sm font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            See All New →
          </Link>
        </div>

        {loading ? (
          <ProductSkeletonGrid count={4} />
        ) : (
          <div className="product-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Best Sellers */}
      <section className="container">
        <div className="flex justify-between items-end" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 className="text-2xl font-bold">Top Rated & Best Sellers</h2>
            <p className="text-sm text-muted">Loved by hundreds of verified customers</p>
          </div>
          <Link
            to="/products?sort=rating"
            className="text-sm font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            See All Top Rated →
          </Link>
        </div>

        {loading ? (
          <ProductSkeletonGrid count={4} />
        ) : (
          <div className="product-grid">
            {bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
