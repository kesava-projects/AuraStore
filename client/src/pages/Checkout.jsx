import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function Checkout() {
  const { items, subtotal, appliedCoupon, couponDiscount, shippingFee, tax, total } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [submitting, setSubmitting] = useState(false);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      api.getAddresses().then((res) => {
        const list = res.addresses || [];
        setSavedAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) {
          setSelectedAddressId(def._id);
          setAddressForm({
            fullName: def.fullName,
            street: def.street,
            city: def.city,
            state: def.state,
            postalCode: def.postalCode,
            country: def.country || 'USA',
            phone: def.phone,
            isDefault: def.isDefault,
          });
        }
      });
    }
  }, [isAuthenticated, user]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone,
      isDefault: addr.isDefault,
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      navigate('/products');
      return;
    }

    if (
      !addressForm.fullName ||
      !addressForm.street ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.postalCode ||
      !addressForm.phone
    ) {
      showToast('Please fill out all required address fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. If user is authenticated and selected 'new' with save as default or new address, save address
      if (isAuthenticated && selectedAddressId === 'new') {
        try {
          await api.addAddress(addressForm);
        } catch (addrErr) {
          console.warn('Could not save address to profile:', addrErr.message);
        }
      }

      // 2. Create Stripe checkout session
      const res = await api.createCheckoutSession({
        shippingAddress: addressForm,
        couponCode: appliedCoupon?.code || null,
      });

      if (res.url) {
        // Redirect browser to Stripe Checkout
        window.location.href = res.url;
      } else {
        throw new Error('No checkout URL returned from payment provider');
      }
    } catch (err) {
      showToast(err.message, 'error');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>
          Add items to your cart before proceeding to checkout.
        </p>
        <Link to="/products" className="btn btn-primary">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 5rem' }}>
      <h1 className="text-3xl font-bold" style={{ marginBottom: '2rem' }}>
        Checkout
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
        }}
      >
        {/* Shipping Address Form */}
        <div>
          {/* If authenticated with saved addresses, show selector */}
          {savedAddresses.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 className="text-lg font-bold" style={{ marginBottom: '1rem' }}>
                Saved Shipping Addresses
              </h2>
              <div className="flex flex-col gap-2">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr._id}
                    className="card flex items-start gap-3"
                    style={{
                      padding: '0.875rem',
                      cursor: 'pointer',
                      border:
                        selectedAddressId === addr._id
                          ? '2px solid var(--color-primary)'
                          : '1px solid var(--bg-border)',
                      backgroundColor:
                        selectedAddressId === addr._id
                          ? 'var(--color-primary-light)'
                          : 'transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name="selected_address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => handleSelectSavedAddress(addr)}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div className="text-sm">
                      <div className="font-bold flex items-center gap-2">
                        {addr.fullName}
                        {addr.isDefault && <span className="badge badge-primary">Default</span>}
                      </div>
                      <div className="text-muted">
                        {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                      </div>
                      <div className="text-muted">Phone: {addr.phone}</div>
                    </div>
                  </label>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAddressId('new');
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
                  }}
                  className="btn btn-sm btn-secondary"
                  style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                >
                  + Use a different address
                </button>
              </div>
            </div>
          )}

          {/* Address Details Form */}
          <form onSubmit={handleSubmitOrder} className="card">
            <h2 className="text-lg font-bold" style={{ marginBottom: '1.25rem' }}>
              {selectedAddressId === 'new' ? 'Shipping Destination' : 'Confirm Shipping Address'}
            </h2>

            <div className="form-group">
              <label className="label">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={addressForm.fullName}
                onChange={handleFormChange}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Street Address *</label>
              <input
                type="text"
                name="street"
                placeholder="123 Main St, Apt 4B"
                value={addressForm.street}
                onChange={handleFormChange}
                className="input"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="label">City *</label>
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleFormChange}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">State / Province *</label>
                <input
                  type="text"
                  name="state"
                  placeholder="CA, NY, etc."
                  value={addressForm.state}
                  onChange={handleFormChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="label">Postal / ZIP Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={addressForm.postalCode}
                  onChange={handleFormChange}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={addressForm.country}
                  onChange={handleFormChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Contact Phone Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="+1 555-0100"
                value={addressForm.phone}
                onChange={handleFormChange}
                className="input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg w-full"
              style={{ marginTop: '1rem' }}
            >
              {submitting ? 'Redirecting to Stripe...' : `Pay $${total.toFixed(2)} with Stripe`}
            </button>
            <p className="text-xs text-muted text-center" style={{ marginTop: '0.75rem' }}>
              🔒 You will be securely redirected to Stripe Checkout in test mode.
            </p>
          </form>
        </div>

        {/* Order Review Sidebar */}
        <div className="card">
          <h2 className="text-lg font-bold" style={{ marginBottom: '1.25rem' }}>
            Review Order ({items.length} items)
          </h2>

          <div
            className="flex flex-col gap-3"
            style={{
              maxHeight: '360px',
              overflowY: 'auto',
              marginBottom: '1.5rem',
              paddingRight: '0.5rem',
            }}
          >
            {items.map((item) => (
              <div key={item.productId || item._id} className="flex gap-3 items-center">
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 className="text-sm font-semibold truncate">{item.title}</h4>
                  <span className="text-xs text-muted">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </span>
                </div>
                <span className="text-sm font-bold">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div
            className="flex flex-col gap-2 text-sm"
            style={{ borderTop: '1px solid var(--bg-border)', paddingTop: '1rem' }}
          >
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between" style={{ color: 'var(--color-success)' }}>
                <span>Coupon ({appliedCoupon.code})</span>
                <span className="font-semibold">-${couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span className="font-semibold">
                {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted">Sales Tax (8%)</span>
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </div>

            <div
              className="flex justify-between items-baseline"
              style={{
                borderTop: '1px solid var(--bg-border)',
                paddingTop: '1rem',
                marginTop: '0.5rem',
              }}
            >
              <span className="text-base font-bold">Total</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
