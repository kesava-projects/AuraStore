import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';

export function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    compareAtPrice: '',
    categoryId: '',
    stock: '',
    sku: '',
    images: '',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.admin.getProducts({ page, limit: 10, q: search }),
        api.getCategories(),
      ]);
      setProducts(prodRes.products || []);
      setTotal(prodRes.total || 0);
      setTotalPages(prodRes.pages || 1);
      setCategories(catRes.categories || []);
    } catch (err) {
      showToast('Error loading products: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setImageFile(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      compareAtPrice: '',
      categoryId: categories[0]?._id || '',
      stock: '10',
      sku: `PROD-${Date.now().toString().slice(-4)}`,
      images: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p._id);
    setImageFile(null);
    setFormData({
      title: p.title,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice || '',
      categoryId: p.categoryId?._id || p.categoryId || '',
      stock: p.stock,
      sku: p.sku,
      images: p.images?.join(', ') || '',
      isActive: p.isActive,
    });
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let body;
      if (imageFile) {
        body = new FormData();
        body.append('image', imageFile);
        body.append('title', formData.title);
        body.append('description', formData.description);
        body.append('price', Number(formData.price));
        if (formData.compareAtPrice) body.append('compareAtPrice', Number(formData.compareAtPrice));
        body.append('categoryId', formData.categoryId);
        body.append('stock', Number(formData.stock));
        body.append('sku', formData.sku.toUpperCase());
        body.append('isActive', formData.isActive);
        if (formData.images) {
          body.append('images', formData.images);
        }
      } else {
        const imageArray = formData.images
          ? formData.images
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        body = {
          title: formData.title,
          description: formData.description,
          price: Number(formData.price),
          compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
          categoryId: formData.categoryId,
          stock: Number(formData.stock),
          sku: formData.sku.toUpperCase(),
          images: imageArray,
          isActive: formData.isActive,
        };
      }

      if (editingId) {
        await api.admin.updateProduct(editingId, body);
        showToast('Product updated successfully', 'success');
      } else {
        await api.admin.createProduct(body);
        showToast('Product created successfully', 'success');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      const msg =
        err.details && Array.isArray(err.details) && err.details.length > 0
          ? err.details.map((d) => (d.field ? `${d.field}: ${d.message}` : d.message)).join('; ')
          : err.message || 'Failed to save product';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.admin.deleteProduct(id);
      showToast('Product deleted', 'info');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 5rem' }}>
      <div
        className="flex flex-col md-row justify-between items-start md-center gap-4"
        style={{ marginBottom: '2rem' }}
      >
        <div>
          <nav className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>
            <Link to="/admin">Admin Dashboard</Link> / <strong>Products</strong>
          </nav>
          <h1 className="text-3xl font-bold">Product Inventory</h1>
          <p className="text-sm text-muted">{total} total products in database</p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          + Add New Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <input
          type="search"
          placeholder="Filter by title or SKU..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input"
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.images?.[0] ||
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=80'
                          }
                          alt={p.title}
                          style={{
                            width: '44px',
                            height: '44px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        />
                        <Link
                          to={`/products/${p.slug}`}
                          target="_blank"
                          className="font-semibold text-sm hover-underline"
                        >
                          {p.title}
                        </Link>
                      </div>
                    </td>
                    <td className="text-xs font-mono">{p.sku}</td>
                    <td className="text-sm">{p.categoryId?.name || 'Uncategorized'}</td>
                    <td className="font-bold text-sm">${p.price.toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${p.stock <= 5 ? (p.stock === 0 ? 'badge-danger' : 'badge-warning') : 'badge-success'}`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {p.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="btn btn-sm text-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="drawer-backdrop flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Create Product'}</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-icon text-muted">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="label">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Compare-At Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="select"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Initial Stock *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Product Image File Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="input"
                />
                <span className="text-xs text-muted">
                  Uploads to Cloudinary (or local server fallback)
                </span>
              </div>

              <div className="form-group">
                <label className="label">Or Image URLs (comma-separated)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label">Description *</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="textarea"
                  required
                />
              </div>

              <label
                className="flex items-center gap-2 text-sm"
                style={{ margin: '1rem 0 1.5rem', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>Product is active and visible in storefront</span>
              </label>

              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn btn-primary w-full">
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
