import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';

export function AdminCustomers() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const res = await api.admin.getCustomers({ page, limit: 15 });
        setCustomers(res.customers || []);
        setTotal(res.total || 0);
        setTotalPages(res.pages || 1);
      } catch (err) {
        showToast('Error loading customers: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, [page, showToast]);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 5rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <nav className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>
            <Link to="/admin">Admin Dashboard</Link> / <strong>Customers</strong>
          </nav>
          <h1 className="text-3xl font-bold">Registered Customers</h1>
          <p className="text-sm text-muted">{total} customer accounts</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Orders Placed</th>
                <th>Total Spent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading customer list...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No customers registered.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id}>
                    <td className="font-semibold text-sm">{c.name}</td>
                    <td className="text-sm text-muted">{c.email}</td>
                    <td className="text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="font-bold text-sm">{c.orderCount}</td>
                    <td className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                      ${c.totalSpent.toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
