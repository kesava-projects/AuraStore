import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { ProductSkeletonGrid } from '../components/common/LoadingSkeleton.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters read from URL params
  const currentCategory = searchParams.get('category') || '';
  const currentQuery = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentMinRating = searchParams.get('minRating') || '';

  // Local filter form state
  const [localMinPrice, setLocalMinPrice] = useState(currentMinPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(currentMaxPrice);
  const [localRating, setLocalRating] = useState(currentMinRating);

  // Load categories once
  useEffect(() => {
    api.getCategories().then((res) => setCategories(res.categories || []));
  }, []);

  // Fetch products whenever searchParams change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        category: currentCategory,
        q: currentQuery,
        sort: currentSort,
        page: currentPage,
        minPrice: currentMinPrice,
        maxPrice: currentMaxPrice,
        minRating: currentMinRating,
        limit: 12,
      });

      setProducts(res.products || []);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error('Error fetching catalog products:', err);
    } finally {
      setLoading(false);
    }
  }, [
    currentCategory,
    currentQuery,
    currentSort,
    currentPage,
    currentMinPrice,
    currentMaxPrice,
    currentMinRating,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // Reset to page 1 on filter changes
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const handleApplyPriceFilter = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localMinPrice) next.set('minPrice', localMinPrice);
    else next.delete('minPrice');
    if (localMaxPrice) next.set('maxPrice', localMaxPrice);
    else next.delete('maxPrice');
    if (localRating) next.set('minRating', localRating);
    else next.delete('minRating');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalRating('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Header bar */}
      <div
        className="flex flex-col md-row justify-between items-start md-center gap-4"
        style={{ marginBottom: '2rem' }}
      >
        <div>
          <h1 className="text-2xl font-bold">
            {currentQuery
              ? `Search Results for "${currentQuery}"`
              : currentCategory
                ? `Category: ${categories.find((c) => c.slug === currentCategory)?.name || currentCategory}`
                : 'All Products'}
          </h1>
          <p className="text-sm text-muted">
            Showing {products.length} of {total} products
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm font-semibold text-muted">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="select"
            style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 0.75rem' }}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Sidebar Filters */}
        <aside
          className="card"
          style={{
            position: 'sticky',
            top: '5.5rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base">Filters</h3>
            {(currentCategory ||
              currentQuery ||
              currentMinPrice ||
              currentMaxPrice ||
              currentMinRating) && (
              <button
                onClick={handleClearFilters}
                className="btn btn-sm text-muted"
                style={{ fontSize: '0.75rem', padding: 0 }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <h4
              className="text-xs font-bold text-muted"
              style={{ textTransform: 'uppercase', marginBottom: '0.75rem' }}
            >
              Category
            </h4>
            <div className="flex flex-col gap-1 text-sm">
              <button
                onClick={() => updateParam('category', '')}
                className="btn btn-sm"
                style={{
                  justifyContent: 'flex-start',
                  backgroundColor: !currentCategory ? 'var(--color-primary-light)' : 'transparent',
                  color: !currentCategory ? 'var(--color-primary)' : 'inherit',
                  fontWeight: !currentCategory ? '700' : '500',
                }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateParam('category', cat.slug)}
                  className="btn btn-sm"
                  style={{
                    justifyContent: 'flex-start',
                    backgroundColor:
                      currentCategory === cat.slug ? 'var(--color-primary-light)' : 'transparent',
                    color: currentCategory === cat.slug ? 'var(--color-primary)' : 'inherit',
                    fontWeight: currentCategory === cat.slug ? '700' : '500',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <form onSubmit={handleApplyPriceFilter}>
            <h4
              className="text-xs font-bold text-muted"
              style={{ textTransform: 'uppercase', marginBottom: '0.75rem' }}
            >
              Price Range ($)
            </h4>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                aria-label="Minimum price"
              />
              <span className="text-muted">-</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                aria-label="Maximum price"
              />
            </div>

            {/* Rating Filter */}
            <h4
              className="text-xs font-bold text-muted"
              style={{ textTransform: 'uppercase', margin: '1rem 0 0.5rem' }}
            >
              Minimum Rating
            </h4>
            <select
              value={localRating}
              onChange={(e) => setLocalRating(e.target.value)}
              className="select"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', marginBottom: '1rem' }}
            >
              <option value="">Any Rating</option>
              <option value="4.5">★ 4.5 & up</option>
              <option value="4.0">★ 4.0 & up</option>
              <option value="3.0">★ 3.0 & up</option>
            </select>

            <button type="submit" className="btn btn-secondary btn-sm w-full">
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Product Grid Area */}
        <div>
          {loading ? (
            <ProductSkeletonGrid count={9} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products matched your criteria"
              description="Try relaxing your filters or searching for another term."
              actionText="Reset All Filters"
              actionLink="/products"
            />
          ) : (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => updateParam('page', p)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
