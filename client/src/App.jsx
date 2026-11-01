import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { Layout } from './components/layout/Layout.jsx';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute.jsx';

// Lazy-loaded pages for performance
const Home = lazy(() => import('./pages/Home.jsx').then((m) => ({ default: m.Home })));
const ProductList = lazy(() =>
  import('./pages/ProductList.jsx').then((m) => ({ default: m.ProductList }))
);
const ProductDetail = lazy(() =>
  import('./pages/ProductDetail.jsx').then((m) => ({ default: m.ProductDetail }))
);
const CartPage = lazy(() => import('./pages/CartPage.jsx').then((m) => ({ default: m.CartPage })));
const Checkout = lazy(() => import('./pages/Checkout.jsx').then((m) => ({ default: m.Checkout })));
const CheckoutSuccess = lazy(() =>
  import('./pages/CheckoutSuccess.jsx').then((m) => ({ default: m.CheckoutSuccess }))
);
const CheckoutCancel = lazy(() =>
  import('./pages/CheckoutCancel.jsx').then((m) => ({ default: m.CheckoutCancel }))
);
const Login = lazy(() => import('./pages/Login.jsx').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register.jsx').then((m) => ({ default: m.Register })));
const Account = lazy(() => import('./pages/Account.jsx').then((m) => ({ default: m.Account })));

// Admin Pages
const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard.jsx').then((m) => ({ default: m.AdminDashboard }))
);
const AdminProducts = lazy(() =>
  import('./pages/admin/AdminProducts.jsx').then((m) => ({ default: m.AdminProducts }))
);
const AdminCategories = lazy(() =>
  import('./pages/admin/AdminCategories.jsx').then((m) => ({ default: m.AdminCategories }))
);
const AdminCoupons = lazy(() =>
  import('./pages/admin/AdminCoupons.jsx').then((m) => ({ default: m.AdminCoupons }))
);
const AdminOrders = lazy(() =>
  import('./pages/admin/AdminOrders.jsx').then((m) => ({ default: m.AdminOrders }))
);
const AdminCustomers = lazy(() =>
  import('./pages/admin/AdminCustomers.jsx').then((m) => ({ default: m.AdminCustomers }))
);

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Layout>
              <Suspense
                fallback={
                  <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                    <p className="text-muted">Loading page...</p>
                  </div>
                }
              >
                <Routes>
                  {/* Public Storefront */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/checkout/cancel" element={<CheckoutCancel />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Customer Protected */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <AdminRoute>
                        <AdminProducts />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/categories"
                    element={
                      <AdminRoute>
                        <AdminCategories />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/coupons"
                    element={
                      <AdminRoute>
                        <AdminCoupons />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <AdminRoute>
                        <AdminOrders />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/customers"
                    element={
                      <AdminRoute>
                        <AdminCustomers />
                      </AdminRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
