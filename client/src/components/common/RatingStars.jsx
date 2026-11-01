import React from 'react';

export function RatingStars({ rating = 0, count, size = 16 }) {
  const rounded = Math.round(rating * 2) / 2;
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
      <div className="flex items-center" style={{ color: '#f59e0b' }}>
        {stars.map((star) => {
          const filled = star <= rounded;
          const half = !filled && star - 0.5 <= rounded;
          return (
            <svg
              key={star}
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={filled ? 'currentColor' : half ? 'url(#half-star)' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="half-star">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                </linearGradient>
              </defs>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        })}
      </div>
      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        {rating > 0 ? rating.toFixed(1) : '0.0'}
        {count !== undefined && ` (${count})`}
      </span>
    </div>
  );
}
