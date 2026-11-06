import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  RefreshCw,
  Star,
  CheckCircle2,
  Mail,
  ShoppingBag,
  MessageCircle,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { HeroBannerCarousel } from '../components/HeroBannerCarousel';
import { AnimatedSection } from '../components/AnimatedSection';
import { useShop } from '../context/ShopContext';

export const HomePage: React.FC = () => {
  const {
    products,
    categories,
    reviews,
    setQuickViewProduct,
    addToCart,
    wishlist,
    toggleWishlist,
    addToast,
  } = useShop();

  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const activeCategories = React.useMemo(() => {
    return categories.filter((c) => c.isActive !== false);
  }, [categories]);

  const approvedReviews = React.useMemo(() => {
    return reviews.filter((r) => r.status !== 'rejected').slice(0, 3);
  }, [reviews]);

  const wishlistIds = wishlist.map((p) => p.id);

  // Curated lists
  const activeProducts = products.filter((p) => p.isActive !== false);
  const featuredProducts = activeProducts.filter((p) => p.isBestSeller || p.isNew).slice(0, 4);
  const newArrivals = activeProducts.filter((p) => p.isNew).slice(0, 4);
  const bestSellers = activeProducts.filter((p) => p.isBestSeller).slice(0, 4);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    setNewsletterSuccess(true);
    addToast('Welcome to the VIP Modest Club! Your 10% coupon is USA2026', 'success');
  };

  const getCategoryPath = (catId: string) => {
    if (catId === 'hijab') return '/category/hijab-scarf';
    return `/category/${catId}`;
  };

  return (
    <div className="space-y-5 sm:space-y-16 w-full max-w-full overflow-hidden">
      {/* 3-Slide Hero Banner Carousel & Two CTA Buttons */}
      <div className="w-full space-y-2.5 sm:space-y-3.5">
        <HeroBannerCarousel onNavigateToShop={() => navigate('/shop')} />

        {/* Quick CTA Action Buttons directly below Hero Banner */}
        <div
          id="hero-cta-buttons"
          className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 flex items-center justify-center gap-2.5 sm:gap-4"
        >
          <Link
            to="/shop"
            id="hero-cta-shop-now-btn"
            className="flex-1 sm:flex-initial min-w-0 max-w-[200px] sm:max-w-none inline-flex items-center justify-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Shop Now</span>
          </Link>

          <a
            href="https://wa.me/18005556868"
            target="_blank"
            rel="noopener noreferrer"
            id="hero-cta-whatsapp-btn"
            className="flex-1 sm:flex-initial min-w-0 max-w-[200px] sm:max-w-none inline-flex items-center justify-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#FAF0F2] hover:bg-[#F3D7DC] text-[#2D6A4F] border border-[#F4D3D7] hover:border-[#2D6A4F] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0 text-[#2D6A4F]" />
            <span className="truncate">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Shop by Category Section */}
      <AnimatedSection yOffset={16}>
        <section id="category-shortcuts-section" className="bg-white py-6 sm:py-16 border-y border-[#F0E4E6]/60 w-full max-w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-3 min-[360px]:px-4 sm:px-6 lg:px-8 w-full min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 sm:mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
                  Curated Collections
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F1E36] mt-1">
                  Shop by Category
                </h2>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2D6A4F] hover:text-[#1B4332] group"
              >
                <span>Explore All Categories</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-6 lg:gap-8 items-start w-full min-w-0">
              {activeCategories.map((category) => {
                const catName = category.nameEn || (category as any).name;
                return (
                  <Link
                    key={category.id}
                    to={getCategoryPath(category.slug || category.id)}
                    id={`category-item-${category.id}`}
                    className="group flex flex-col items-center text-center cursor-pointer min-w-0 transition-transform duration-300 hover:-translate-y-1"
                  >
                    {/* Circular Category Image */}
                    <div className="w-full aspect-square max-w-[84px] min-[360px]:max-w-[100px] sm:max-w-[130px] md:max-w-[140px] lg:max-w-[165px] rounded-full overflow-hidden bg-[#FAF7F6] ring-2 ring-transparent group-hover:ring-[#2D6A4F]/25 shadow-2xs group-hover:shadow-md transition-all duration-300">
                      <img
                        src={category.image}
                        alt={catName}
                        loading="lazy"
                        className="w-full h-full object-cover object-center rounded-full group-hover:scale-108 transition-transform duration-500 ease-out"
                      />
                    </div>

                    {/* Category Name & Pink Arrow */}
                    <div className="mt-2 sm:mt-4 flex items-center justify-center gap-1 text-center min-w-0 w-full px-0.5">
                      <span className="font-serif text-[11px] min-[360px]:text-xs sm:text-sm md:text-base font-semibold text-[#0F1E36] group-hover:text-[#2D6A4F] transition-colors leading-tight truncate">
                        {catName}
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-[#E58C9D] text-xs sm:text-sm md:text-base font-medium group-hover:translate-x-1 transition-transform inline-block flex-shrink-0"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Trust & Craftsmanship Highlights */}
      <AnimatedSection yOffset={14}>
        <section className="max-w-7xl mx-auto px-3 min-[360px]:px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-8 rounded-2xl bg-[#FAF0F2] border border-[#F4D3D7] w-full min-w-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#F0E4E6] flex items-center justify-center text-[#2D6A4F] shadow-2xs flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#0F1E36]">Fast USA Delivery</h4>
                <p className="text-xs text-slate-600">Free shipping on orders over $75</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#F0E4E6] flex items-center justify-center text-[#E58C9D] shadow-2xs flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#0F1E36]">Opaque & Modest</h4>
                <p className="text-xs text-slate-600">Guaranteed non-sheer luxury crepe</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#F0E4E6] flex items-center justify-center text-[#2D6A4F] shadow-2xs flex-shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#0F1E36]">30-Day Returns</h4>
                <p className="text-xs text-slate-600">Hassle-free USA prepaid exchange</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#F0E4E6] flex items-center justify-center text-[#0F1E36] shadow-2xs flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#0F1E36]">Dallas Atelier QC</h4>
                <p className="text-xs text-slate-600">Hand-inspected before dispatch</p>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Featured Products Section */}
      <AnimatedSection yOffset={16}>
        <section id="featured-products-section" className="max-w-7xl mx-auto px-3 min-[360px]:px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
                Handpicked Styles
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1E36] mt-1">
                Featured Products
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2D6A4F] hover:text-[#1B4332] group"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 w-full min-w-0">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={toggleWishlist}
                onAddToCartDirect={(p) => addToCart(p)}
              />
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* New Arrivals Section */}
      <AnimatedSection yOffset={16}>
        <section id="new-arrivals-section" className="max-w-7xl mx-auto px-3 min-[360px]:px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
                Fresh from the Atelier
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1E36] mt-1">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/new-arrivals"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2D6A4F] hover:text-[#1B4332] group"
            >
              <span>View All New Pieces</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 w-full min-w-0">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={toggleWishlist}
                onAddToCartDirect={(p) => addToCart(p)}
              />
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* Best Sellers Section */}
      <AnimatedSection yOffset={16}>
        <section id="best-sellers-section" className="max-w-7xl mx-auto px-3 min-[360px]:px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
                Client Favorites
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1E36] mt-1">
                Best Sellers
              </h2>
            </div>
            <Link
              to="/best-sellers"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2D6A4F] hover:text-[#1B4332] group"
            >
              <span>View All Best Sellers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 w-full min-w-0">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={toggleWishlist}
                onAddToCartDirect={(p) => addToCart(p)}
              />
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* Customer Testimonials */}
      <AnimatedSection yOffset={16}>
        <section className="bg-[#FAF7F6] border-y border-[#F0E4E6] py-12 sm:py-16 w-full max-w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-3 min-[360px]:px-4 sm:px-6 lg:px-8 w-full min-w-0">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
                Loved by Modest Shoppers
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1E36] mt-1">
                What Our USA Customers Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full min-w-0">
              {approvedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-2xl bg-white border border-[#F0E4E6] shadow-2xs flex flex-col justify-between w-full min-w-0"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <h4 className="font-serif text-base font-bold text-[#0F1E36]">
                      "{rev.title}"
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F5EBED] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F1E36]">{rev.userName || rev.customerName}</span>
                    <span className="text-[11px] font-medium text-[#2D6A4F] bg-[#EBF5F0] px-2 py-0.5 rounded">
                      Verified Buyer
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Newsletter Section */}
      <AnimatedSection yOffset={16}>
        <section id="home-newsletter-section" className="max-w-4xl mx-auto px-3 min-[360px]:px-4 sm:px-6 lg:px-8 pb-8 w-full min-w-0">
          <div className="bg-gradient-to-br from-[#FAF0F2] via-white to-[#F8ECEF] border border-[#F4D3D7] rounded-3xl p-6 sm:p-12 text-center space-y-6 shadow-xs w-full min-w-0">
            <div className="w-12 h-12 mx-auto rounded-full bg-white border border-[#F4D3D7] flex items-center justify-center text-[#2D6A4F] shadow-2xs">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1E36]">
                Join the VIP Modest Circle
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Subscribe for early access to limited capsule releases, modest styling edits, and an instant 10% coupon code off your first order.
              </p>
            </div>

            {newsletterSuccess ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EBF5F0] text-[#2D6A4F] font-semibold text-sm border border-[#52B788]">
                <CheckCircle2 className="w-5 h-5" />
                <span>You're subscribed! Use coupon code <strong>USA2026</strong> for 10% off.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 w-full">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white border border-[#EADBDE] text-sm text-[#0F1E36] placeholder-slate-400 focus:outline-hidden focus:border-[#2D6A4F] shadow-2xs"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}

            <p className="text-[11px] text-slate-400">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
};
