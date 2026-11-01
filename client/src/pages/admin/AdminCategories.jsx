import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', parentId: '' });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      showToast('Error loading categories: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', parentId: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c._id);
    setFormData({
      name: c.name,
      slug: c.slug,
      parentId: c.parentId?._id || c.parentId || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name: formData.name,
        slug: formData.slug || undefined,
        parentId: formData.parentId || null,
      };

      if (editingId) {
        await api.admin.updateCategory(editingId, body);
        showToast('Category updated', 'success');
      } else {
        await api.admin.createCategory(body);
        showToast('Category created', 'success');
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.admin.deleteCategory(id);
      showToast('Category deleted', 'info');
      loadCategories();
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
            <Link to="/admin">Admin Dashboard</Link> / <strong>Categories</strong>
          </nav>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-sm text-muted">{categories.length} categories configured</p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          + Add Category
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c._id}>
                    <td className="font-semibold text-sm">{c.name}</td>
                    <td className="text-xs font-mono">{c.slug}</td>
                    <td className="text-sm text-muted">{c.parentId?.name || 'Top-level'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
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

      {showModal && (
        <div
          className="drawer-backdrop flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '440px' }}
          >
            <h2 className="text-lg font-bold" style={{ marginBottom: '1.25rem' }}>
              {editingId ? 'Edit Category' : 'Create Category'}
            </h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="label">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Slug (optional)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-if-empty"
                  className="input"
                />
              </div>

              <div className="flex gap-2" style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary w-full">
                  Save
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
