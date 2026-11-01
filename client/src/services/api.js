const BASE_URL = process.env.VITE_API_URL;

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // essential for httpOnly cookie authentication
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error = new Error(data?.error?.message || response.statusText || 'Request failed');
    error.code = data?.error?.code || 'UNKNOWN_ERROR';
    error.statusCode = response.status;
    error.details = data?.error?.details;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Catalog
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request(`/products?${query.toString()}`);
  },
  getProductBySlug: (slug) => request(`/products/${slug}`),
  getCategories: () => request('/categories'),

  // Cart
  getCart: () => request('/cart'),
  updateCart: (items) => request('/cart', { method: 'PUT', body: JSON.stringify({ items }) }),
  mergeCart: (items) => request('/cart/merge', { method: 'POST', body: JSON.stringify({ items }) }),

  // Checkout & Coupons
  createCheckoutSession: (body) =>
    request('/checkout/session', { method: 'POST', body: JSON.stringify(body) }),
  validateCoupon: (code, subtotal) =>
    request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),

  // Orders
  getOrders: () => request('/orders'),
  getOrderById: (id) => request(`/orders/${id}`),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: 'PATCH' }),

  // Account
  getAddresses: () => request('/me/addresses'),
  addAddress: (body) => request('/me/addresses', { method: 'POST', body: JSON.stringify(body) }),
  updateAddress: (id, body) =>
    request(`/me/addresses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAddress: (id) => request(`/me/addresses/${id}`, { method: 'DELETE' }),
  toggleWishlist: (productId) => request(`/me/wishlist/${productId}`, { method: 'POST' }),
  addReview: (productId, body) =>
    request(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  admin: {
    getProducts: (params = {}) => {
      const query = new URLSearchParams(params);
      return request(`/admin/products?${query.toString()}`);
    },
    createProduct: (body) => {
      const isForm = body instanceof FormData;
      return request('/admin/products', {
        method: 'POST',
        body: isForm ? body : JSON.stringify(body),
      });
    },
    updateProduct: (id, body) => {
      const isForm = body instanceof FormData;
      return request(`/admin/products/${id}`, {
        method: 'PUT',
        body: isForm ? body : JSON.stringify(body),
      });
    },
    deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),

    getCategories: () => request('/admin/categories'),
    createCategory: (body) =>
      request('/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
    updateCategory: (id, body) =>
      request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),

    getCoupons: () => request('/admin/coupons'),
    createCoupon: (body) =>
      request('/admin/coupons', { method: 'POST', body: JSON.stringify(body) }),
    updateCoupon: (id, body) =>
      request(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteCoupon: (id) => request(`/admin/coupons/${id}`, { method: 'DELETE' }),

    getOrders: (params = {}) => {
      const query = new URLSearchParams(params);
      return request(`/admin/orders?${query.toString()}`);
    },
    updateOrderStatus: (id, status, note) =>
      request(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      }),

    getCustomers: (params = {}) => {
      const query = new URLSearchParams(params);
      return request(`/admin/customers?${query.toString()}`);
    },
    getSalesReport: () => request('/admin/reports/sales'),
  },
};
