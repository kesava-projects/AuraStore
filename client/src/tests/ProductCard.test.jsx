import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { CartProvider } from '../context/CartContext.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';

const mockProduct = {
  _id: 'prod123',
  title: 'Wireless Headphones',
  slug: 'wireless-headphones',
  price: 99.99,
  compareAtPrice: 129.99,
  stock: 15,
  ratingAvg: 4.8,
  ratingCount: 30,
  images: ['https://example.com/headphones.jpg'],
  categoryId: { name: 'Electronics', slug: 'electronics' },
};

describe('ProductCard Component', () => {
  it('renders product information correctly', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ProductCard product={mockProduct} />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$129.99')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
});
