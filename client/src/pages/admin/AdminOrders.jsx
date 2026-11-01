import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';

const STATUS_TRANSITIONS = {
  placed: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getOrders({
        page,
        limit: 15,
        status: statusFilter,
      });
      setOrders(res.orders || []);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch (err) {
      showToast('Error loading orders: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleOpenStatusModal = (ord) => {
    setSelectedOrder(ord);
    const nextPossible = STATUS_TRANSITIONS[ord.orderStatus] || [];
    setNewStatus(nextPossible[0] || '');
    setNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    setUpdating(true);
    try {
      await api.admin.updateOrderStatus(selectedOrder._id, newStatus, note);
      showToast(`Order status updated to ${newStatus}`, 'success');
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdating(false);
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
            <Link to="/admin">Admin Dashboard</Link> / <strong>Orders</strong>
          </nav>
          <h1 className="text-3xl font-bold">Fulfillment & Order Control</h1>
          <p className="text-sm text-muted">{total} orders in selected view</p>
        </div>

        {/* Filter by status */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-muted">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="select"
            style={{ width: 'auto' }}
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const allowedTransitions = STATUS_TRANSITIONS[ord.orderStatus] || [];
                  return (
                    <tr key={ord._id}>
                      <td
                        className="font-mono text-xs font-bold"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        #{ord._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="text-sm">
                        <div className="font-semibold">
                          {ord.shippingAddress?.fullName || ord.userId?.name || 'Customer'}
                        </div>
                        <div className="text-xs text-muted">{ord.userId?.email}</div>
                      </td>
                      <td className="text-sm">{ord.items.length} items</td>
                      <td className="font-bold text-sm">${ord.total.toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge ${ord.paymentStatus === 'paid' ? 'badge-success' : ord.paymentStatus === 'refunded' ? 'badge-warning' : 'badge-danger'}`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${ord.orderStatus === 'delivered' ? 'badge-success' : ord.orderStatus === 'cancelled' ? 'badge-danger' : 'badge-primary'}`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td>
                        {allowedTransitions.length > 0 ? (
                          <button
                            onClick={() => handleOpenStatusModal(ord)}
                            className="btn btn-secondary btn-sm"
                          >
                            Update Status
                          </button>
                        ) : (
                          <span className="text-xs text-muted">Finalized</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Status Update Modal */}
      {selectedOrder && (
        <div
          className="drawer-backdrop flex items-center justify-center"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '440px' }}
          >
            <h2 className="text-lg font-bold" style={{ marginBottom: '0.5rem' }}>
              Update Order Status
            </h2>
            <p className="text-xs text-muted" style={{ marginBottom: '1.25rem' }}>
              Order #{selectedOrder._id} • Current: <strong>{selectedOrder.orderStatus}</strong>
            </p>

            <form onSubmit={handleUpdateStatus}>
              <div className="form-group">
                <label className="label">Transition To *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="select"
                  required
                >
                  {(STATUS_TRANSITIONS[selectedOrder.orderStatus] || []).map((st) => (
                    <option key={st} value={st}>
                      {st.toUpperCase()}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-muted">
                  Order status can only transition forward in sequence.
                </span>
              </div>

              <div className="form-group">
                <label className="label">Timeline Note</label>
                <input
                  type="text"
                  placeholder="e.g. Dispatched via DHL Express tracking #994"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex gap-2" style={{ marginTop: '1.5rem' }}>
                <button type="submit" disabled={updating} className="btn btn-primary w-full">
                  {updating ? 'Updating...' : 'Confirm Status Change'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
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
