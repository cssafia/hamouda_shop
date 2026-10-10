// src/layouts/ClientLayout.jsx
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/client/Header';
import Footer from '../components/client/Footer';
import WhatsAppFloat from '../components/client/WhatsAppFloat';
import CartDrawer from '../pages/client/Cart/CartDrawer';

export default function ClientLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <WhatsAppFloat />

      <CartDrawer />
    </div>
  );
}