import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';

export function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await api.admin.getSalesReport();
        setReport(data);
      } catch (err) {
        console.error('Failed to load sales report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        <p className="text-muted">Loading analytics and sales report...</p>
      </div>
    );
  }

  const summary = report?.summary || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };
  const statusCounts = report?.statusCounts || {};
  const categorySales = report?.categorySales || [];
  const recentOrders = report?.recentOrders || [];

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 5rem' }}>
      {/* Admin Nav Header */}
      <div
        className="flex flex-col md-row justify-between items-start md-center gap-4"
        style={{ marginBottom: '2rem' }}
      >
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.25rem' }}>
            Admin Control Center
          </span>
          <h1 className="text-3xl font-bold">Sales & Operations Dashboard</h1>
        </div>

        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <Link to="/admin/products" className="btn btn-secondary btn-sm">
            Products
          </Link>
          <Link to="/admin/categories" className="btn btn-secondary btn-sm">
            Categories
          </Link>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm">
            Orders
          </Link>
          <Link to="/admin/coupons" className="btn btn-secondary btn-sm">
            Coupons
          </Link>
          <Link to="/admin/customers" className="btn btn-secondary btn-sm">
            Customers
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card">
          <span className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase' }}>
            Total Revenue
          </span>
          <div
            className="text-3xl font-bold"
            style={{ color: 'var(--color-primary)', margin: '0.5rem 0' }}
          >
            ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-muted">Confirmed paid orders</span>
        </div>

        <div className="card">
          <span className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase' }}>
            Paid Orders
          </span>
          <div className="text-3xl font-bold" style={{ margin: '0.5rem 0' }}>
            {summary.totalOrders}
          </div>
          <span className="text-xs text-muted">Successfully fulfilled or in transit</span>
        </div>

        <div className="card">
          <span className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase' }}>
            Average Order Value
          </span>
          <div className="text-3xl font-bold" style={{ margin: '0.5rem 0' }}>
            ${summary.averageOrderValue.toFixed(2)}
          </div>
          <span className="text-xs text-muted">Per completed transaction</span>
        </div>
      </div>

      {/* Orders By Status Grid */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h2 className="text-lg font-bold" style={{ marginBottom: '1rem' }}>
          Orders by Operational Status
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
          }}
        >
          {['placed', 'packed', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <div
              key={st}
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <span className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase' }}>
                {st}
              </span>
              <div className="text-2xl font-bold" style={{ marginTop: '0.25rem' }}>
                {statusCounts[st] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Category Sales Chart & Recent Orders */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2rem',
        }}
      >
        {/* Category Sales Breakdown */}
        <div className="card">
          <h2 className="text-lg font-bold" style={{ marginBottom: '1.25rem' }}>
            Sales by Category
          </h2>
          {categorySales.length === 0 ? (
            <p className="text-muted text-sm">No sales data recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {categorySales.map((cat) => {
                const maxSales = Math.max(...categorySales.map((c) => c.totalSales), 1);
                const percent = Math.round((cat.totalSales / maxSales) * 100);

                return (
                  <div key={cat.category}>
                    <div
                      className="flex justify-between text-sm"
                      style={{ marginBottom: '0.35rem' }}
                    >
                      <span className="font-semibold">{cat.category}</span>
                      <span>
                        <strong>${cat.totalSales.toFixed(2)}</strong> ({cat.unitsSold} units)
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'var(--bg-border)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          backgroundColor: 'var(--color-primary)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Orders List */}
        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
            <h2 className="text-lg font-bold">Recent Paid Orders</h2>
            <Link
              to="/admin/orders"
              className="text-sm font-semibold"
              style={{ color: 'var(--color-primary)' }}
            >
              All Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-muted text-sm">No recent orders.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="flex justify-between items-center text-sm"
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <div className="font-semibold">{ord.userId?.name || 'Customer'}</div>
                    <div className="text-xs text-muted">
                      {ord.items.length} items • {new Date(ord.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary">{ord.orderStatus}</span>
                    <strong className="font-bold">${ord.total.toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
