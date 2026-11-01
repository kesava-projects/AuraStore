import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export function AdminCoupons() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percent',
    value: '10',
    minOrder: '0',
    maxUses: '',
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    isActive: true,
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getCoupons();
      setCoupons(res.coupons || []);
    } catch (err) {
      showToast('Error loading coupons: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      code: '',
      type: 'percent',
      value: '10',
      minOrder: '0',
      maxUses: '100',
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      isActive: true,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const body = {
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: Number(formData.value),
        minOrder: Number(formData.minOrder) || 0,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        expiresAt: new Date(formData.expiresAt),
        isActive: formData.isActive,
      };

      if (editingId) {
        await api.admin.updateCoupon(editingId, body);
        showToast('Coupon updated', 'success');
      } else {
        await api.admin.createCoupon(body);
        showToast('Coupon created', 'success');
      }
      setShowModal(false);
      loadCoupons();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.admin.deleteCoupon(id);
      showToast('Coupon deleted', 'info');
      loadCoupons();
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
            <Link to="/admin">Admin Dashboard</Link> / <strong>Coupons</strong>
          </nav>
          <h1 className="text-3xl font-bold">Promotional Coupons</h1>
          <p className="text-sm text-muted">Manage promo codes and discount rules</p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          + Create Coupon
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No coupons created yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const isExpired = new Date(c.expiresAt) < new Date();
                  return (
                    <tr key={c._id}>
                      <td className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                        {c.code}
                      </td>
                      <td className="text-sm font-semibold">
                        {c.type === 'percent' ? `${c.value}% Off` : `$${c.value.toFixed(2)} Off`}
                      </td>
                      <td className="text-sm">${c.minOrder?.toFixed(2) || '0.00'}</td>
                      <td className="text-sm">
                        {c.usedCount} / {c.maxUses ?? '∞'}
                      </td>
                      <td className="text-xs">
                        <span style={{ color: isExpired ? 'var(--color-danger)' : 'inherit' }}>
                          {new Date(c.expiresAt).toLocaleDateString()}
                          {isExpired && ' (Expired)'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${c.isActive && !isExpired ? 'badge-success' : 'badge-danger'}`}
                        >
                          {c.isActive && !isExpired ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="btn btn-sm text-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
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
              Create Coupon
            </h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="label">Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. FLASH25"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="input"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="select"
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Min Order ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Max Uses Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Expiration Date *</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="flex gap-2" style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary w-full">
                  Save Coupon
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
