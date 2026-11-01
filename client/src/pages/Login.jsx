import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="container" style={{ padding: '4rem 1.25rem', maxWidth: '440px' }}>
      <div className="card">
        <h1 className="text-2xl font-bold" style={{ marginBottom: '0.5rem' }}>
          Welcome Back
        </h1>
        <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>
          Sign in to your account to manage orders, addresses, and wishlist.
        </p>

        {error && (
          <div
            className="card"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger)',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full"
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Logins Box */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--bg-border)',
          }}
        >
          <span className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase' }}>
            Quick Demo Logins
          </span>
          <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@example.com', 'Password123!')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('alice@example.com', 'Password123!')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              👤 Customer Demo
            </button>
          </div>
        </div>

        <p className="text-sm text-center text-muted" style={{ marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
