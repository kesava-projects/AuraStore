import React from 'react';

export function ProductSkeletonGrid({ count = 8 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="skeleton" style={{ width: '100%', height: '200px' }} />
          <div
            style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div className="skeleton" style={{ width: '40%', height: '14px' }} />
            <div className="skeleton" style={{ width: '80%', height: '18px' }} />
            <div className="skeleton" style={{ width: '30%', height: '22px' }} />
            <div
              className="skeleton"
              style={{ width: '100%', height: '36px', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        margin: '2rem 0',
      }}
    >
      <div
        className="skeleton"
        style={{ width: '100%', height: '450px', borderRadius: 'var(--radius-lg)' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ width: '30%', height: '16px' }} />
        <div className="skeleton" style={{ width: '80%', height: '32px' }} />
        <div className="skeleton" style={{ width: '40%', height: '24px' }} />
        <div className="skeleton" style={{ width: '25%', height: '36px' }} />
        <div className="skeleton" style={{ width: '100%', height: '100px' }} />
        <div
          className="skeleton"
          style={{ width: '60%', height: '48px', borderRadius: 'var(--radius-md)' }}
        />
      </div>
    </div>
  );
}
