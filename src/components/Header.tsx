import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Flame,
  Ruler,
  Package,
  Truck,
  RotateCcw,
  HelpCircle,
  Phone,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { TopAnnouncementBanner } from './TopAnnouncementBanner';
import { ThreeDotMenu, ThreeDotMenuItem } from './ThreeDotMenu';
import { useShop } from '../context/ShopContext';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, wishlistCount, setIsSearchOpen, setIsSizeGuideOpen, isAdmin } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent background scroll and support Escape key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Women', path: '/category/women' },
    { label: 'Men', path: '/category/men' },
    { label: 'Kids', path: '/category/kids' },
    { label: 'New Arrivals', path: '/new-arrivals' },
    { label: 'Best Sellers', path: '/best-sellers' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const categorySublinks = [
    { label: 'All Modest Shop', path: '/shop' },
    { label: 'Women’s Collection', path: '/category/women' },
    { label: 'Abayas & Kaftans', path: '/category/abaya' },
    { label: 'Hijab & Scarves', path: '/category/hijab-scarf' },
    { label: 'Men’s Kurtas & Thobes', path: '/category/men' },
    { label: 'Kids Modest Apparel', path: '/category/kids' },
    { label: 'Pins, Caps & Accessories', path: '/category/accessories' },
  ];

  const quickFilterLinks = [
    { label: 'New Arrivals', path: '/new-arrivals', icon: Sparkles },
    { label: 'Best Sellers', path: '/best-sellers', icon: Flame },
  ];

  const headerMenuItems: ThreeDotMenuItem[] = [
    ...(isAdmin
      ? [
          {
            id: 'admin-portal',
            label: 'Admin Portal',
            icon: ShieldCheck,
            to: '/admin',
            badge: 'Admin',
          },
        ]
      : []),
    {
      id: 'size-guide',
      label: 'Size & Fit Guide',
      icon: Ruler,
      onClick: () => setIsSizeGuideOpen(true),
    },
    {
      id: 'track-order',
      label: 'Track Order & History',
      icon: Package,
      to: '/account/orders',
    },
    {
      id: 'shipping-info',
      label: 'USA Shipping Policy',
      icon: Truck,
      to: '/shipping',
      badge: 'Free >$75',
    },
    {
      id: 'returns-info',
      label: '30-Day Easy Returns',
      icon: RotateCcw,
      to: '/returns',
    },
    {
      id: 'faqs',
      label: 'Help & FAQs',
      icon: HelpCircle,
      to: '/faq',
    },
    {
      id: 'contact-us',
      label: 'Contact Concierge',
      icon: Phone,
      to: '/contact',
    },
    {
      id: 'about-brand',
      label: 'About Mumtahina’s',
      icon: Info,
      to: '/about',
    },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F0E4E6] shadow-xs">
      {/* Top Promotional Announcement Banner Carousel */}
      <TopAnnouncementBanner />

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-2 min-[360px]:px-3 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="flex items-center justify-between h-16 sm:h-20 w-full min-w-0 gap-1 sm:gap-2">
          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center lg:hidden flex-shrink-0">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 min-[360px]:p-1.5 text-[#0F1E36] hover:text-[#2D6A4F] rounded-lg focus:outline-hidden"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center min-w-0 flex-shrink-1">
            <Link to="/" aria-label="Mumtahina’s Closet Inc Home" className="min-w-0">
              <BrandLogo size="md" />
            </Link>
          </div>

          {/* Desktop Search Bar Trigger */}
          <div className="hidden md:flex flex-1 max-w-xs mx-4 lg:mx-8">
            <div
              id="desktop-search-trigger"
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-500 bg-[#FAF7F6] border border-[#EADBDE] hover:border-[#2D6A4F] rounded-full cursor-pointer transition-colors shadow-2xs group"
            >
              <Search className="w-4 h-4 text-slate-400 group-hover:text-[#2D6A4F]" />
              <span className="text-xs tracking-normal truncate">
                Search abayas, hijabs, dresses...
              </span>
            </div>
          </div>

          {/* Action Icons: Search (mobile), Account, Phone/WhatsApp, Wishlist, Cart, 3-Dot Menu */}
          <div className="flex items-center gap-0.5 min-[360px]:gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
            {/* Mobile Search Icon */}
            <button
              id="mobile-search-btn"
              onClick={() => setIsSearchOpen(true)}
              className="p-1 min-[360px]:p-1.5 sm:p-2 text-[#0F1E36] hover:text-[#2D6A4F] md:hidden rounded-full hover:bg-[#FAF0F2] transition-colors"
              aria-label="Search Store"
            >
              <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>

            {/* Account Icon */}
            <Link
              to="/account"
              id="header-account-btn"
              className={`p-1 min-[360px]:p-1.5 sm:p-2 text-[#0F1E36] hover:text-[#2D6A4F] rounded-full hover:bg-[#FAF0F2] transition-colors ${
                location.pathname.startsWith('/account') ? 'text-[#2D6A4F] bg-[#EBF5F0]' : ''
              }`}
              title="Customer Account"
              aria-label="Customer Account"
            >
              <User className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </Link>

            {/* Phone/WhatsApp Support Contact */}
            <a
              href="https://wa.me/18005556868"
              target="_blank"
              rel="noopener noreferrer"
              id="header-phone-whatsapp-btn"
              className="p-1 min-[360px]:p-1.5 sm:p-2 text-[#0F1E36] hover:text-[#2D6A4F] rounded-full hover:bg-[#FAF0F2] transition-colors"
              title="Concierge Support (Phone / WhatsApp: +1 800 555-6868)"
              aria-label="Contact Concierge Support via Phone or WhatsApp"
            >
              <Phone className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#2D6A4F]" />
            </a>

            {/* Wishlist Icon with Counter */}
            <Link
              to="/wishlist"
              id="header-wishlist-btn"
              className={`relative p-1 min-[360px]:p-1.5 sm:p-2 text-[#0F1E36] hover:text-[#2D6A4F] rounded-full hover:bg-[#FAF0F2] transition-colors ${
                location.pathname === '/wishlist' ? 'text-[#2D6A4F] bg-[#EBF5F0]' : ''
              }`}
              title="Saved Wishlist"
              aria-label="Saved Wishlist"
            >
              <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-200 hover:scale-110 active:scale-95" />
              {wishlistCount > 0 && (
                <span
                  key={wishlistCount}
                  id="wishlist-badge"
                  className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 flex items-center justify-center min-w-[15px] h-[15px] sm:min-w-[18px] sm:h-[18px] px-0.5 sm:px-1 text-[9px] sm:text-[10px] font-bold text-white bg-[#E58C9D] rounded-full ring-1.5 sm:ring-2 ring-white animate-badge-pop"
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon with Counter */}
            <Link
              to="/cart"
              id="header-cart-btn"
              className={`relative p-1 min-[360px]:p-1.5 sm:p-2 text-[#0F1E36] hover:text-[#2D6A4F] rounded-full hover:bg-[#FAF0F2] transition-colors ${
                location.pathname === '/cart' ? 'text-[#2D6A4F] bg-[#EBF5F0]' : ''
              }`}
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-200 hover:scale-110 active:scale-95" />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  id="cart-badge"
                  className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 flex items-center justify-center min-w-[15px] h-[15px] sm:min-w-[18px] sm:h-[18px] px-0.5 sm:px-1 text-[9px] sm:text-[10px] font-bold text-white bg-[#2D6A4F] rounded-full ring-1.5 sm:ring-2 ring-white animate-badge-pop"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* 3-Dot (⋮) More Options Menu */}
            <ThreeDotMenu
              id="header-three-dot-menu"
              ariaLabel="More store options"
              buttonSize="responsive"
              buttonClassName="hover:bg-[#FAF0F2]"
              items={headerMenuItems}
            />
          </div>
        </div>

        {/* Desktop Main Navigation Bar */}
        <nav
          id="desktop-main-navigation"
          aria-label="Main Navigation"
          className="hidden lg:flex items-center justify-center space-x-6 xl:space-x-8 py-2.5 border-t border-[#F5EBED]"
        >
          {navLinks.map((item) => {
            const active = isLinkActive(item.path);

            return (
              <Link
                key={item.label}
                to={item.path}
                id={`nav-link-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                className={`relative text-[13px] uppercase tracking-wider font-semibold py-1.5 transition-colors duration-200 cursor-pointer group ${
                  active
                    ? 'text-[#2D6A4F]'
                    : 'text-[#0F1E36] hover:text-[#2D6A4F]'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#2D6A4F] rounded-full transition-transform duration-300 ease-out origin-left ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 opacity-60 group-hover:opacity-100'
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu Portaled to document.body to bypass header backdrop-filter and sticky clipping */}
      {mobileMenuOpen &&
        createPortal(
          <div
            id="mobile-navigation-drawer-portal"
            className="fixed inset-0 z-[99999] lg:hidden flex"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Content */}
            <div
              className="relative w-[280px] min-[360px]:w-[320px] max-w-[calc(100vw-24px)] h-full h-[100dvh] max-h-[100dvh] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#F0E4E6] flex items-center justify-between bg-[#FAF0F2] flex-shrink-0">
                <BrandLogo size="sm" onClick={() => { setMobileMenuOpen(false); navigate('/'); }} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-[#0F1E36] rounded-full hover:bg-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body Links */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-6">
                {/* Quick High-Priority Highlights */}
                <div className="space-y-1.5 pb-3 border-b border-[#F5EBED]">
                  {quickFilterLinks.map((qf) => {
                    const Icon = qf.icon;
                    return (
                      <Link
                        key={qf.label}
                        to={qf.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF0F2] text-[#0F1E36] font-medium text-sm hover:bg-[#F4D3D7]/40 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[#2D6A4F]" />
                          {qf.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>
                    );
                  })}
                </div>

                {/* Main Navigation */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    Collections & Categories
                  </p>
                  <div className="space-y-1">
                    {categorySublinks.map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-medium transition-colors ${
                          location.pathname === item.path
                            ? 'bg-[#EBF5F0] text-[#2D6A4F] font-semibold'
                            : 'text-[#0F1E36] hover:bg-[#FAF7F6]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Company & Support Links */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    Company & Support
                  </p>
                  <div className="space-y-1">
                    <Link
                      to="/about"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2.5 rounded-xl text-sm text-[#0F1E36] hover:bg-[#FAF7F6] transition-colors"
                    >
                      About Mumtahina’s Closet Inc
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2.5 rounded-xl text-sm text-[#0F1E36] hover:bg-[#FAF7F6] transition-colors"
                    >
                      Contact Concierge
                    </Link>
                    <Link
                      to="/faq"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2.5 rounded-xl text-sm text-[#0F1E36] hover:bg-[#FAF7F6] transition-colors"
                    >
                      Frequently Asked Questions (FAQ)
                    </Link>
                    <Link
                      to="/shipping"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2.5 rounded-xl text-sm text-[#0F1E36] hover:bg-[#FAF7F6] transition-colors"
                    >
                      USA Shipping & Delivery
                    </Link>
                    <Link
                      to="/returns"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2.5 rounded-xl text-sm text-[#0F1E36] hover:bg-[#FAF7F6] transition-colors"
                    >
                      30-Day Return & Refund Policy
                    </Link>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Account CTA */}
              <div className="p-4 border-t border-[#F0E4E6] bg-[#FAF7F6] space-y-2 flex-shrink-0">
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#E58C9D]" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>My Account / Orders</span>
                </Link>
                <p className="text-[11px] text-center text-slate-500">
                  Dallas, TX • Free USA Shipping over $75
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
