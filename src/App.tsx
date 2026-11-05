/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ShopProvider, useShop } from './context/ShopContext';

// Core Components
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchModal } from './components/SearchModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { Toast } from './components/Toast';
import { ScrollToTop } from './components/ScrollToTop';
import { AdminRoute } from './components/AdminRoute';
import { ProtectedRoute } from './components/ProtectedRoute';

// Multi-Page Routes
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { SearchPage } from './pages/SearchPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { AuthPage } from './pages/AuthPage';
import { StaticPages } from './pages/StaticPages';
import { AdminPage } from './pages/AdminPage';
import { SetupPage } from './pages/SetupPage';

const AppLayout: React.FC = () => {
  const {
    products,
    quickViewProduct,
    setQuickViewProduct,
    isSearchOpen,
    setIsSearchOpen,
    isSizeGuideOpen,
    setIsSizeGuideOpen,
    addToCart,
    toggleWishlist,
    isWishlisted,
    toasts,
    removeToast,
  } = useShop();

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F6] text-[#0F1E36] font-sans antialiased w-full max-w-full min-w-0">
      <ScrollToTop />
      {/* Top Header with 3 Announcement Banners & Navigation (storefront only) */}
      {!isAdminRoute && <Header />}

      {/* Main Multi-Page Route Content */}
      <main className={`flex-1 w-full max-w-full min-w-0 ${!isAdminRoute ? 'pb-16 md:pb-0' : ''}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{
              duration: shouldReduceMotion ? 0.05 : 0.26,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-full flex-1 flex flex-col min-w-0"
          >
            <Routes location={location}>
              {/* 1. HOME PAGE */}
              <Route path="/" element={<HomePage />} />

              {/* 2. SHOP / ALL PRODUCTS */}
              <Route path="/shop" element={<ShopPage />} />

              {/* 3-8. CATEGORIES */}
              <Route path="/category/:categorySlug" element={<ShopPage />} />

              {/* 9-10. NEW ARRIVALS & BEST SELLERS */}
              <Route path="/new-arrivals" element={<ShopPage isNewArrivalsOnly />} />
              <Route path="/best-sellers" element={<ShopPage isBestSellersOnly />} />

              {/* 11. PRODUCT DETAILS */}
              <Route path="/product/:productId" element={<ProductDetailsPage />} />

              {/* 12. SEARCH RESULTS */}
              <Route path="/search" element={<SearchPage />} />

              {/* 13. WISHLIST */}
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />

              {/* 14. CART */}
              <Route path="/cart" element={<CartPage />} />

              {/* 15. CHECKOUT */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />

              {/* 16. USER ACCOUNT / PROFILE */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />

              {/* 17. ORDER HISTORY / TRACKING */}
              <Route
                path="/account/orders"
                element={
                  <ProtectedRoute>
                    <OrderHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrderHistoryPage />
                  </ProtectedRoute>
                }
              />

              {/* 18-19. LOGIN & REGISTER */}
              <Route path="/login" element={<AuthPage initialMode="login" />} />
              <Route path="/admin/login" element={<AuthPage initialMode="login" />} />
              <Route path="/register" element={<AuthPage initialMode="register" />} />
              <Route path="/forgot-password" element={<AuthPage initialMode="forgot" />} />

              {/* 20. STATIC PAGES */}
              <Route path="/about" element={<StaticPages page="about" />} />
              <Route path="/contact" element={<StaticPages page="contact" />} />
              <Route path="/faq" element={<StaticPages page="faq" />} />
              <Route path="/shipping-policy" element={<StaticPages page="shipping" />} />
              <Route path="/shipping" element={<StaticPages page="shipping" />} />
              <Route path="/return-policy" element={<StaticPages page="returns" />} />
              <Route path="/returns" element={<StaticPages page="returns" />} />
              <Route path="/privacy-policy" element={<StaticPages page="privacy" />} />
              <Route path="/privacy" element={<StaticPages page="privacy" />} />
              <Route path="/terms-of-service" element={<StaticPages page="terms" />} />
              <Route path="/terms" element={<StaticPages page="terms" />} />

              {/* 21. STORE ADMINISTRATION PANEL */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />

              {/* 22. DATABASE SETUP & HEALTH CHECK */}
              <Route path="/setup" element={<SetupPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Storefront Footer (storefront only) */}
      {!isAdminRoute && <Footer />}

      {/* Mobile Sticky Bottom Navigation (storefront only) */}
      {!isAdminRoute && <MobileBottomNav />}

      {/* Global Interactive Modals (storefront only) */}
      {!isAdminRoute && (
        <>
          <QuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={addToCart}
            isWishlisted={quickViewProduct ? isWishlisted(quickViewProduct.id) : false}
            onToggleWishlist={toggleWishlist}
          />

          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            products={products}
          />

          <SizeGuideModal
            isOpen={isSizeGuideOpen}
            onClose={() => setIsSizeGuideOpen(false)}
          />
        </>
      )}

      {/* Global Notification Toast Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ShopProvider>
        <AppLayout />
      </ShopProvider>
    </BrowserRouter>
  );
}
