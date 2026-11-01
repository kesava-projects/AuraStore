import React from 'react';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { CartDrawer } from '../cart/CartDrawer.jsx';

export function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <CartDrawer />
      <Footer />
    </>
  );
}
