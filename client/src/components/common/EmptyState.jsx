import React from 'react';
import { Link } from 'react-router-dom';

export function EmptyState({
  title = 'No items found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  actionText = 'Browse Products',
  actionLink = '/products',
  icon,
}) {
  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        maxWidth: '500px',
        margin: '2rem auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)',
        }}
      >
        {icon || (
          <svg
            width="32"
            height="32"
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
        )}
      </div>
      <div>
        <h3 className="text-xl font-bold" style={{ marginBottom: '0.5rem' }}>
          {title}
        </h3>
        <p className="text-muted text-sm">{description}</p>
      </div>
      {actionLink && (
        <Link to={actionLink} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          {actionText}
        </Link>
      )}
    </div>
  );
}
