import React from 'react';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav
      className="flex items-center justify-center gap-2"
      style={{ margin: '2.5rem 0' }}
      aria-label="Pagination Navigation"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-secondary btn-sm"
        aria-label="Previous Page"
      >
        ‹ Prev
      </button>

      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="btn btn-secondary btn-sm">
            1
          </button>
          {startPage > 2 && <span className="text-muted">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-secondary'}`}
          aria-current={p === currentPage ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-muted">…</span>}
          <button onClick={() => onPageChange(totalPages)} className="btn btn-secondary btn-sm">
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-secondary btn-sm"
        aria-label="Next Page"
      >
        Next ›
      </button>
    </nav>
  );
}
