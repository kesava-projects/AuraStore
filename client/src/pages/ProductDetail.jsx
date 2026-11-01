import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { RatingStars } from '../components/common/RatingStars.jsx';
import { DetailSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated, toggleWishlist, isItemInWishlist } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await api.getProductBySlug(slug);
        setProduct(res.product);
        if (res.product.images?.length > 0) {
          setActiveImage(res.product.images[0]);
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1.25rem' }}>
        <DetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>
          The product you are looking for does not exist or has been removed.
        </p>
        <Link to="/products" className="btn btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const inWishlist = isItemInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please provide a comment for your review.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.addReview(product._id, { rating: Number(rating), comment });
      showToast('Review submitted successfully! Thank you.', 'success');
      setProduct((prev) => ({
        ...prev,
        ratingAvg: res.productRating.ratingAvg,
        ratingCount: res.productRating.ratingCount,
        reviews: [res.review, ...(prev.reviews || [])],
      }));
      setComment('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 5rem' }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted" style={{ marginBottom: '2rem' }}>
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Catalog</Link>
        <span>/</span>
        {product.categoryId && (
          <>
            <Link to={`/products?category=${product.categoryId.slug}`}>
              {product.categoryId.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="font-semibold" style={{ color: 'var(--text-main)' }}>
          {product.title}
        </span>
      </nav>

      {/* Main Product Showcase */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
          marginBottom: '4rem',
        }}
      >
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div
            style={{
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--bg-border)',
              position: 'relative',
              paddingTop: '80%',
            }}
          >
            <img
              src={
                activeImage ||
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
              }
              alt={product.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-2" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border:
                      activeImage === img
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--bg-border)',
                    padding: 0,
                  }}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Actions */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <span className="text-xs font-semibold text-muted">SKU: {product.sku}</span>
              {isOutOfStock ? (
                <span className="badge badge-danger">Out of Stock</span>
              ) : isLowStock ? (
                <span className="badge badge-warning">Only {product.stock} left</span>
              ) : (
                <span className="badge badge-success">In Stock ({product.stock})</span>
              )}
            </div>

            <h1
              className="text-3xl font-bold"
              style={{ lineHeight: 1.25, marginBottom: '0.75rem' }}
            >
              {product.title}
            </h1>

            <RatingStars rating={product.ratingAvg} count={product.ratingCount} size={18} />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3" style={{ margin: '0.5rem 0' }}>
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="compare-price text-lg">${product.compareAtPrice.toFixed(2)}</span>
                <span className="badge badge-danger">Save {discountPercent}%</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-muted" style={{ lineHeight: 1.7 }}>
            {product.description}
          </p>

          {/* Attributes List */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                margin: '0.5rem 0',
              }}
            >
              <h4
                className="text-xs font-bold text-muted"
                style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}
              >
                Specifications
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key}>
                    <span className="text-muted">{key}: </span>
                    <strong style={{ color: 'var(--text-main)' }}>{val}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4" style={{ marginTop: '1rem' }}>
            <div
              className="flex items-center"
              style={{
                border: '1px solid var(--bg-border)',
                borderRadius: 'var(--radius-md)',
                height: '46px',
              }}
            >
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="btn"
                style={{ padding: '0 0.85rem', height: '100%' }}
                disabled={isOutOfStock || quantity <= 1}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="font-semibold text-sm" style={{ padding: '0 0.75rem' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="btn"
                style={{ padding: '0 0.85rem', height: '100%' }}
                disabled={isOutOfStock || quantity >= product.stock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              onClick={() => toggleWishlist(product._id)}
              className={`btn btn-secondary btn-icon ${inWishlist ? 'text-danger' : ''}`}
              style={{ height: '46px', width: '46px', minWidth: '46px' }}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={inWishlist ? 'var(--color-danger)' : 'none'}
                stroke={inWishlist ? 'var(--color-danger)' : 'currentColor'}
                strokeWidth="2"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section style={{ borderTop: '1px solid var(--bg-border)', paddingTop: '3rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <div>
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <div className="flex items-center gap-2" style={{ marginTop: '0.25rem' }}>
              <RatingStars rating={product.ratingAvg} count={product.ratingCount} size={18} />
              <span className="text-sm text-muted">
                Based on {product.reviews?.length || 0} verified reviews
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2.5rem',
          }}
        >
          {/* Reviews List */}
          <div className="flex flex-col gap-4">
            {!product.reviews || product.reviews.length === 0 ? (
              <p className="text-muted text-sm">
                No reviews yet for this product. Be the first to share your thoughts!
              </p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev._id} className="card" style={{ padding: '1.25rem' }}>
                  <div
                    className="flex justify-between items-center"
                    style={{ marginBottom: '0.5rem' }}
                  >
                    <span className="font-bold text-sm">{rev.userId?.name || 'Customer'}</span>
                    <span className="text-xs text-muted">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <RatingStars rating={rev.rating} size={14} />
                  <p className="text-sm" style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Write a review form */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 className="font-bold text-lg" style={{ marginBottom: '1rem' }}>
              Write a Review
            </h3>

            {!isAuthenticated ? (
              <p className="text-sm text-muted">
                Please{' '}
                <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  sign in
                </Link>{' '}
                to leave a review.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="label">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="select"
                  >
                    <option value="5">★★★★★ - 5 Stars (Excellent)</option>
                    <option value="4">★★★★☆ - 4 Stars (Good)</option>
                    <option value="3">★★★☆☆ - 3 Stars (Average)</option>
                    <option value="2">★★☆☆☆ - 2 Stars (Below Average)</option>
                    <option value="1">★☆☆☆☆ - 1 Star (Poor)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Your Comments</label>
                  <textarea
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share how this product fits, performs, or feels..."
                    className="textarea"
                    required
                  />
                </div>

                <p className="text-xs text-muted" style={{ marginBottom: '1rem' }}>
                  * Reviews are allowed only for products you have received from a delivered order.
                </p>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary w-full"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
