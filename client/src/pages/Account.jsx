import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

const STATUS_STEPS = ['placed', 'packed', 'shipped', 'delivered'];

export function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  const { user, fetchCurrentUser } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    phone: '',
    isDefault: false,
  });

  const loadAccountData = async () => {
    try {
      const [ordersRes, addrsRes] = await Promise.all([api.getOrders(), api.getAddresses()]);
      setOrders(ordersRes.orders || []);
      setAddresses(addrsRes.addresses || []);
      await fetchCurrentUser();
    } catch (err) {
      console.error('Error loading account data:', err);
    }
  };

  useEffect(() => {
    loadAccountData();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (
      !window.confirm(
        'Are you sure you want to cancel this order? If paid, a refund will be processed and stock restored.'
      )
    ) {
      return;
    }

    try {
      const res = await api.cancelOrder(orderId);
      showToast(res.message, 'success');
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.order : o)));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        const res = await api.updateAddress(editingAddressId, addressForm);
        setAddresses(res.addresses);
        showToast('Address updated successfully', 'success');
      } else {
        const res = await api.addAddress(addressForm);
        setAddresses(res.addresses);
        showToast('Address added successfully', 'success');
      }
      setShowAddressModal(false);
      setEditingAddressId(null);
      setAddressForm({
        fullName: user?.name || '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA',
        phone: '',
        isDefault: false,
      });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this saved address?')) return;
    try {
      const res = await api.deleteAddress(id);
      setAddresses(res.addresses);
      showToast('Address removed', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country || 'USA',
      phone: addr.phone,
      isDefault: addr.isDefault || false,
    });
    setShowAddressModal(true);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 5rem' }}>
      {/* Account Header */}
      <div
        className="card flex flex-col md-row justify-between items-start md-center gap-4"
        style={{ marginBottom: '2rem' }}
      >
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.25rem' }}>
            {user?.role === 'admin' ? 'Administrator' : 'Customer Account'}
          </span>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-sm text-muted">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn btn-outline">
              Admin Portal
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-2"
        style={{ borderBottom: '1px solid var(--bg-border)', marginBottom: '2rem' }}
      >
        <button
          onClick={() => setSearchParams({ tab: 'orders' })}
          className="btn btn-sm"
          style={{
            borderRadius: '0',
            borderBottom:
              activeTab === 'orders' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'orders' ? 'var(--color-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'orders' ? '700' : '500',
            paddingBottom: '0.75rem',
          }}
        >
          Orders ({orders.length})
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'addresses' })}
          className="btn btn-sm"
          style={{
            borderRadius: '0',
            borderBottom:
              activeTab === 'addresses'
                ? '3px solid var(--color-primary)'
                : '3px solid transparent',
            color: activeTab === 'addresses' ? 'var(--color-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'addresses' ? '700' : '500',
            paddingBottom: '0.75rem',
          }}
        >
          Addresses ({addresses.length})
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'wishlist' })}
          className="btn btn-sm"
          style={{
            borderRadius: '0',
            borderBottom:
              activeTab === 'wishlist' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'wishlist' ? 'var(--color-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'wishlist' ? '700' : '500',
            paddingBottom: '0.75rem',
          }}
        >
          Wishlist ({user?.wishlist?.length || 0})
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="flex flex-col gap-6">
          {orders.length === 0 ? (
            <EmptyState
              title="No orders placed yet"
              description="Explore our catalog and your orders will show up here with live status tracking."
              actionText="Start Shopping"
              actionLink="/products"
            />
          ) : (
            orders.map((order) => {
              const canCancel = order.orderStatus === 'placed' || order.orderStatus === 'packed';
              const currentStepIdx = STATUS_STEPS.indexOf(order.orderStatus);

              return (
                <div key={order._id} className="card">
                  {/* Order header */}
                  <div
                    className="flex flex-col md-row justify-between items-start md-center gap-2"
                    style={{
                      borderBottom: '1px solid var(--bg-border)',
                      paddingBottom: '1rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div>
                      <span className="text-xs text-muted">ORDER #{order._id}</span>
                      <div className="text-xs text-muted">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`badge ${
                          order.paymentStatus === 'paid'
                            ? 'badge-success'
                            : order.paymentStatus === 'refunded'
                              ? 'badge-warning'
                              : 'badge-danger'
                        }`}
                      >
                        Payment: {order.paymentStatus.toUpperCase()}
                      </span>

                      <span
                        className={`badge ${
                          order.orderStatus === 'delivered'
                            ? 'badge-success'
                            : order.orderStatus === 'cancelled'
                              ? 'badge-danger'
                              : 'badge-primary'
                        }`}
                      >
                        Status: {order.orderStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {order.orderStatus !== 'cancelled' ? (
                    <div className="timeline" style={{ margin: '1.5rem 1rem 2rem' }}>
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIdx;
                        const isActive = idx === currentStepIdx;
                        return (
                          <div
                            key={step}
                            className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                          >
                            <div className="timeline-dot">{isCompleted ? '✓' : idx + 1}</div>
                            <span
                              className="text-xs font-semibold"
                              style={{ textTransform: 'capitalize' }}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: 'var(--color-danger-bg)',
                        color: 'var(--color-danger)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        margin: '1rem 0',
                      }}
                    >
                      ❌ This order has been cancelled and any payments were refunded.
                    </div>
                  )}

                  {/* Items List */}
                  <div className="flex flex-col gap-3" style={{ marginBottom: '1.25rem' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={
                            item.image ||
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=80'
                          }
                          alt={item.title}
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <span className="text-sm font-semibold">{item.title}</span>
                          <div className="text-xs text-muted">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </div>
                        </div>
                        <span className="text-sm font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div
                    className="flex justify-between items-center text-sm"
                    style={{ borderTop: '1px solid var(--bg-border)', paddingTop: '1rem' }}
                  >
                    <div>
                      <span className="text-muted">Total: </span>
                      <strong className="text-lg">${order.total.toFixed(2)}</strong>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="btn btn-outline btn-sm text-danger"
                        style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h2 className="text-lg font-bold">Saved Shipping Addresses</h2>
            <button
              onClick={() => {
                setEditingAddressId(null);
                setAddressForm({
                  fullName: user?.name || '',
                  street: '',
                  city: '',
                  state: '',
                  postalCode: '',
                  country: 'USA',
                  phone: '',
                  isDefault: addresses.length === 0,
                });
                setShowAddressModal(true);
              }}
              className="btn btn-primary btn-sm"
            >
              + Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <EmptyState
              title="No saved addresses"
              description="Add an address for one-click checkout."
              actionText="+ Add Address"
              actionLink="#"
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {addresses.map((addr) => (
                <div key={addr._id} className="card flex flex-col justify-between">
                  <div>
                    <div
                      className="flex justify-between items-start"
                      style={{ marginBottom: '0.5rem' }}
                    >
                      <strong className="text-base">{addr.fullName}</strong>
                      {addr.isDefault && <span className="badge badge-primary">Default</span>}
                    </div>
                    <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
                      {addr.street}
                      <br />
                      {addr.city}, {addr.state} {addr.postalCode}
                      <br />
                      {addr.country}
                      <br />
                      Phone: {addr.phone}
                    </p>
                  </div>

                  <div
                    className="flex gap-2"
                    style={{
                      marginTop: '1.25rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--bg-border)',
                    }}
                  >
                    <button
                      onClick={() => openEditAddress(addr)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="btn btn-sm text-danger"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal for adding/editing address */}
          {showAddressModal && (
            <div
              className="drawer-backdrop flex items-center justify-center"
              onClick={() => setShowAddressModal(false)}
            >
              <div
                className="card"
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
              >
                <div
                  className="flex justify-between items-center"
                  style={{ marginBottom: '1.25rem' }}
                >
                  <h3 className="font-bold text-lg">
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="btn btn-icon text-muted"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveAddress}>
                  <div className="form-group">
                    <label className="label">Full Name *</label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Street Address *</label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="label">City *</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">State *</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="label">Postal Code *</label>
                      <input
                        type="text"
                        value={addressForm.postalCode}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, postalCode: e.target.value })
                        }
                        className="input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Phone Number *</label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                  </div>

                  <label
                    className="flex items-center gap-2 text-sm"
                    style={{ margin: '1rem 0 1.5rem', cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, isDefault: e.target.checked })
                      }
                    />
                    <span>Set as my default shipping address</span>
                  </label>

                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary w-full">
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(false)}
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
      )}

      {/* TAB 3: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          {!user?.wishlist || user.wishlist.length === 0 ? (
            <EmptyState
              title="Your wishlist is empty"
              description="Click the heart icon on any product to save it here for later."
              actionText="Browse Catalog"
              actionLink="/products"
            />
          ) : (
            <div className="product-grid">
              {user.wishlist.map((item) => {
                const product = typeof item === 'object' ? item : null;
                if (!product || !product.title) return null;
                return <ProductCard key={product._id} product={product} />;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
