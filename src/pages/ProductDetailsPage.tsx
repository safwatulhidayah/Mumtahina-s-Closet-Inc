import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Ruler,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Share2,
  Zap,
  Check,
} from 'lucide-react';
import { Product, Review } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ThreeDotMenu, ThreeDotMenuItem } from '../components/ThreeDotMenu';
import { useShop } from '../context/ShopContext';

export const ProductDetailsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const {
    products,
    addToCart,
    buyNow,
    wishlist,
    toggleWishlist,
    isWishlisted,
    setIsSizeGuideOpen,
    setQuickViewProduct,
    addToast,
    reviews,
    addReview,
    currentUser,
  } = useShop();

  // Find product by id from route params, or fallback to first product
  const product: Product =
    products.find((p) => p.id === productId) || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || 'Original');
  const [quantity, setQuantity] = useState(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Accordion toggles
  const [openSection, setOpenSection] = useState<'details' | 'fabric' | 'shipping' | 'returns'>('details');

  // Customer reviews form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Product reviews from live Firestore reviews collection
  const productReviews = useMemo(() => {
    if (!product?.id) return [];
    return reviews.filter(
      (r) => r.productId === product.id || (!r.productId && product.id === 'mc-01')
    );
  }, [reviews, product?.id]);

  // Reset local state when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedSize(product?.sizes?.[0] || 'Standard');
    setSelectedColor(product?.colors?.[0]?.name || 'Original');
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.id]);

  const wishlistIds = wishlist.map((p) => p.id);
  const isCurrentWishlisted = isWishlisted(product?.id || '');

  const relatedProducts = products
    .filter((p) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authorName = newReviewAuthor.trim() || currentUser?.name || 'Valued Client';
    if (!authorName || !newReviewComment.trim()) return;

    await addReview({
      productId: product.id,
      customerName: `${authorName} (Verified)`,
      userName: `${authorName} (Verified)`,
      rating: newReviewRating,
      title: newReviewTitle || 'Exquisite modest quality',
      comment: newReviewComment,
      verified: true,
      status: 'approved',
    });

    setShowReviewForm(false);
    setNewReviewAuthor('');
    setNewReviewTitle('');
    setNewReviewComment('');
  };

  const toggleAccordion = (section: 'details' | 'fabric' | 'shipping' | 'returns') => {
    setOpenSection(openSection === section ? ('' as any) : section);
  };

  const handleBuyNowClick = () => {
    buyNow(product, selectedSize, selectedColor, quantity, () => {
      navigate('/checkout');
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Product link copied to clipboard!', 'info');
    }
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const productMenuItems: ThreeDotMenuItem[] = [
    {
      id: 'share-product',
      label: 'Share Product Link',
      icon: Share2,
      onClick: handleShare,
    },
    {
      id: 'toggle-wishlist',
      label: isCurrentWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist',
      icon: Heart,
      onClick: () => toggleWishlist(product),
      badge: isCurrentWishlisted ? 'Saved' : undefined,
    },
    {
      id: 'size-guide',
      label: 'View Modest Size Guide',
      icon: Ruler,
      onClick: () => setIsSizeGuideOpen(true),
    },
    {
      id: 'shipping-info',
      label: 'USA Delivery & Returns Info',
      icon: Truck,
      onClick: () => {
        setOpenSection('shipping');
        const el = document.getElementById('product-shipping-accordion');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 min-[360px]:px-4 sm:px-6 lg:px-8 py-6 sm:py-12 w-full min-w-0">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 overflow-x-auto max-w-full whitespace-nowrap pb-1 scrollbar-none">
        <Link to="/" className="hover:text-[#2D6A4F] cursor-pointer">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#2D6A4F] cursor-pointer">
          Shop
        </Link>
        <span>/</span>
        <Link
          to={`/category/${product.category === 'hijab' ? 'hijab-scarf' : product.category}`}
          className="hover:text-[#2D6A4F] cursor-pointer"
        >
          {product.categoryLabel}
        </Link>
        <span>/</span>
        <span className="text-[#0F1E36] font-semibold truncate max-w-[160px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Product Grid: Gallery (Left) & Purchasing Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 w-full min-w-0">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 min-w-0 w-full">
          {/* Thumbnails list */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[580px] pb-2 sm:pb-0 scrollbar-thin max-w-full">
            {product.images.map((imgUrl, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`relative flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  activeImageIndex === index
                    ? 'border-[#2D6A4F] ring-2 ring-[#2D6A4F]/20'
                    : 'border-[#F0E4E6] hover:border-[#E58C9D]'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} preview ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>

          {/* Large Main Showcase Image */}
          <div className="relative flex-1 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAF7F6] border border-[#F0E4E6] aspect-[3/4] sm:aspect-auto sm:min-h-[580px] w-full min-w-0 group">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={activeImageIndex}
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0.7, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0.75 }}
                transition={{
                  duration: shouldReduceMotion ? 0.05 : 0.28,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="w-full h-full object-cover object-top will-change-transform"
              />
            </AnimatePresence>

            {/* Gallery Carousel Arrow Controls */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex(
                      (prev) => (prev - 1 + product.images.length) % product.images.length
                    )
                  }
                  className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-[#0F1E36] shadow-md backdrop-blur-xs flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all z-10 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F1E36]" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev + 1) % product.images.length)
                  }
                  className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-[#0F1E36] shadow-md backdrop-blur-xs flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all z-10 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F1E36]" />
                </button>

                {/* Mobile indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex sm:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs z-10">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        activeImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isSale && (
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#E58C9D] text-white shadow-sm">
                  Save {discountPercent}%
                </span>
              )}
              {product.isNew && (
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#2D6A4F] text-white shadow-sm">
                  New Arrival
                </span>
              )}
              {product.isBestSeller && !product.isSale && (
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#0F1E36] text-white shadow-sm">
                  Best Seller
                </span>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2.5 sm:p-3 rounded-full backdrop-blur-md transition-colors shadow-sm cursor-pointer ${
                  isCurrentWishlisted
                    ? 'bg-white text-[#E58C9D]'
                    : 'bg-white/90 text-[#0F1E36] hover:text-[#E58C9D]'
                }`}
                title={isCurrentWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                aria-label={isCurrentWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${isCurrentWishlisted ? 'fill-[#E58C9D]' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 sm:p-3 rounded-full bg-white/90 text-[#0F1E36] hover:text-[#2D6A4F] backdrop-blur-md transition-colors shadow-sm cursor-pointer"
                title="Share this modest look"
                aria-label="Share this product"
              >
                <Share2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </button>

              <div className="bg-white/90 rounded-full backdrop-blur-md shadow-sm">
                <ThreeDotMenu
                  id="product-details-menu"
                  ariaLabel="Product actions"
                  buttonSize="sm"
                  buttonClassName="p-2.5 sm:p-3 hover:bg-white text-[#0F1E36] hover:text-[#2D6A4F]"
                  items={productMenuItems}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Purchasing & Details Options */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
                {product.categoryLabel}
              </span>
              <div className="flex items-center gap-1.5 text-amber-500">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">
                  ({product.reviewCount} verified reviews)
                </span>
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F1E36] leading-tight">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {product.subtitle}
            </p>
          </div>

          {/* Pricing Block */}
          <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-[#FAF0F2]/70 border border-[#F4D3D7]/60">
            <span className="text-2xl sm:text-3xl font-bold text-[#0F1E36]">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-base text-slate-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            {product.isSale && (
              <span className="text-xs font-bold text-[#6B2135] bg-white px-2 py-0.5 rounded-full border border-[#F4D3D7]">
                Save ${(product.originalPrice! - product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F1E36]">
                  Color: <strong className="text-[#2D6A4F]">{selectedColor}</strong>
                </span>
                <span className="text-[11px] text-slate-500">
                  {product.colors.length} {product.colors.length === 1 ? 'Option' : 'Options'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F1E36] text-white border-[#0F1E36] shadow-xs'
                          : 'bg-white text-slate-700 border-[#EADBDE] hover:border-[#2D6A4F]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs flex-shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection & Sizing Guide Modal Link */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F1E36]">
                  Abaya & Dress Length: <strong className="text-[#2D6A4F]">{selectedSize}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2D6A4F] hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size & Length Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {product.sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-xs'
                          : 'bg-white text-slate-700 border-[#EADBDE] hover:border-[#2D6A4F]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quantity selector */}
              <div className="flex items-center border border-[#EADBDE] rounded-xl bg-white shadow-2xs flex-shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2.5 sm:px-3.5 py-2.5 text-slate-500 hover:text-[#0F1E36] text-sm font-bold cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-7 sm:w-8 text-center text-xs font-bold text-[#0F1E36]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2.5 sm:px-3.5 py-2.5 text-slate-500 hover:text-[#0F1E36] text-sm font-bold cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                id="details-add-to-cart-btn"
                onClick={() => {
                  setIsAddedFeedback(true);
                  setTimeout(() => setIsAddedFeedback(false), 1400);
                  addToCart(product, selectedSize, selectedColor, quantity);
                }}
                className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-3 sm:px-6 rounded-xl text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] cursor-pointer ${
                  isAddedFeedback
                    ? 'bg-[#2D6A4F] scale-[1.01]'
                    : 'bg-[#0F1E36] hover:bg-[#1C2E4C]'
                }`}
              >
                {isAddedFeedback ? (
                  <>
                    <Check className="w-4 h-4 flex-shrink-0 animate-in zoom-in-95 text-emerald-200" />
                    <span className="truncate">Added to Shopping Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Add to Shopping Bag</span>
                  </>
                )}
              </button>
            </div>

            {/* Buy Now Direct Button */}
            <button
              id="details-buy-now-btn"
              onClick={handleBuyNowClick}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 sm:px-6 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span>Instant Buy Now</span>
            </button>
          </div>

          {/* Trust Value Badges */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-[#F0E4E6] text-[10px] sm:text-[11px] text-slate-600">
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#FAF7F6] min-w-0">
              <Truck className="w-4 h-4 text-[#2D6A4F] mb-1 flex-shrink-0" />
              <span className="font-semibold truncate max-w-full">Free Shipping</span>
              <span className="text-[9px] sm:text-[10px] text-slate-400">Over $75</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#FAF7F6] min-w-0">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F] mb-1 flex-shrink-0" />
              <span className="font-semibold truncate max-w-full">Opaque Quality</span>
              <span className="text-[9px] sm:text-[10px] text-slate-400">Zero Sheerness</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#FAF7F6] min-w-0">
              <RotateCcw className="w-4 h-4 text-[#2D6A4F] mb-1 flex-shrink-0" />
              <span className="font-semibold truncate max-w-full">30-Day Returns</span>
              <span className="text-[9px] sm:text-[10px] text-slate-400">Prepaid USA label</span>
            </div>
          </div>

          {/* Accordion Specification Sections */}
          <div className="space-y-2 border-t border-[#F0E4E6] pt-4">
            {/* Description & Silhouette */}
            <div className="border border-[#F0E4E6] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('details')}
                className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-[#0F1E36]"
              >
                <span>Description & Cut Highlights</span>
                {openSection === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openSection === 'details' && (
                <div className="px-3.5 pb-4 text-xs text-slate-600 leading-relaxed space-y-2 border-t border-[#FAF0F2]">
                  <p>{product.description}</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-500 pt-1">
                    <li>Custom tailored in modest proportions with relaxed sleeve openings.</li>
                    <li>Designed to eliminate the need for excess under-layers.</li>
                    <li>Includes detachable matching waist belt and complimentary chiffon hijab wrap.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Fabric & Care */}
            <div className="border border-[#F0E4E6] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('fabric')}
                className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-[#0F1E36]"
              >
                <span>Fabric & Garment Care</span>
                {openSection === 'fabric' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openSection === 'fabric' && (
                <div className="px-3.5 pb-4 text-xs text-slate-600 leading-relaxed space-y-1.5 border-t border-[#FAF0F2]">
                  <p><strong>Composition:</strong> 100% Premium Matte Nida / Raw Silk Crepe Blend.</p>
                  <p><strong>Opacity Level:</strong> Level 5 (Highest - 100% opaque under full sunlight).</p>
                  <p><strong>Washing Instructions:</strong> Machine wash cold on delicate cycle or hand wash. Hang to dry. Low steam iron.</p>
                </div>
              )}
            </div>

            {/* Shipping & Delivery Information */}
            <div className="border border-[#F0E4E6] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-[#0F1E36]"
              >
                <span>Shipping & Delivery Information</span>
                {openSection === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openSection === 'shipping' && (
                <div className="px-3.5 pb-4 text-xs text-slate-600 leading-relaxed space-y-1.5 border-t border-[#FAF0F2]">
                  <p>All orders are dispatched directly from our studio in <strong>Dallas, Texas, USA</strong>.</p>
                  <p><strong>Standard Delivery:</strong> 3-5 business days across the contiguous United States via USPS Priority Mail or UPS Ground.</p>
                  <p><strong>Expedited 2-Day:</strong> Available at checkout for urgent events and Eid occasions.</p>
                  <p>Free standard shipping on all orders over $75.</p>
                </div>
              )}
            </div>

            {/* Return Information */}
            <div className="border border-[#F0E4E6] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('returns')}
                className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-[#0F1E36]"
              >
                <span>Return & Exchange Policy</span>
                {openSection === 'returns' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openSection === 'returns' && (
                <div className="px-3.5 pb-4 text-xs text-slate-600 leading-relaxed space-y-1.5 border-t border-[#FAF0F2]">
                  <p>We want you to feel completely poised in every piece. If the length or cut is not perfect, you may return or exchange within <strong>30 days of delivery</strong>.</p>
                  <p>Garments must be unworn, unwashed, with original atelier tags attached. Prepaid return labels are provided via our USA returns portal.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Feedback Section */}
      <section id="reviews-section" className="border-t border-[#F0E4E6] pt-12 mb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
              Verified Feedback
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#0F1E36]">
              Customer Reviews ({productReviews.length})
            </h2>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-5 py-2.5 rounded-xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>

        {/* Review Submission Form */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white p-6 rounded-2xl border border-[#F0E4E6] mb-8 space-y-4 max-w-2xl"
          >
            <h3 className="font-serif text-base font-bold text-[#0F1E36]">
              Share your experience with this piece
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="e.g. Fatima K."
                  required
                  className="w-full px-3 py-2 text-xs border border-[#EADBDE] rounded-lg focus:outline-hidden focus:border-[#2D6A4F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                <select
                  value={newReviewRating}
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-[#EADBDE] rounded-lg focus:outline-hidden focus:border-[#2D6A4F]"
                >
                  <option value={5}>5 Stars - Perfect fit & opacity</option>
                  <option value={4}>4 Stars - Very good quality</option>
                  <option value={3}>3 Stars - Average fit</option>
                  <option value={2}>2 Stars - Not as expected</option>
                  <option value={1}>1 Star - Poor experience</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Review Headline</label>
              <input
                type="text"
                value={newReviewTitle}
                onChange={(e) => setNewReviewTitle(e.target.value)}
                placeholder="e.g. Beautiful fabric drape and zero sheerness"
                className="w-full px-3 py-2 text-xs border border-[#EADBDE] rounded-lg focus:outline-hidden focus:border-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Detailed Comments</label>
              <textarea
                rows={3}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="Describe the texture, length suitability, opacity, and styling compliments you received..."
                required
                className="w-full px-3 py-2 text-xs border border-[#EADBDE] rounded-lg focus:outline-hidden focus:border-[#2D6A4F]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1B4332] transition-colors"
            >
              Post Review
            </button>
          </form>
        )}

        {/* Reviews List */}
        {productReviews.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#FCFAF7] border border-[#F0E4E6] text-center">
            <p className="text-xs text-slate-500">No client reviews yet for this silhouette. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-white border border-[#F0E4E6] shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">{rev.date}</span>
                </div>

                <h4 className="font-serif text-sm font-bold text-[#0F1E36]">
                  {rev.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {rev.comment}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-[#FAF0F2]">
                  <span className="text-xs font-semibold text-[#0F1E36]">{rev.userName || rev.customerName}</span>
                  {rev.verified && (
                    <span className="text-[10px] font-medium text-[#2D6A4F] bg-[#EBF5F0] px-2 py-0.5 rounded">
                      Verified USA Buyer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section id="related-products-section" className="border-t border-[#F0E4E6] pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
                Complete The Wardrobe
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#0F1E36] mt-1">
                You May Also Love
              </h2>
            </div>
            <Link
              to={`/category/${product.category === 'hijab' ? 'hijab-scarf' : product.category}`}
              className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] hover:underline"
            >
              View More {product.categoryLabel} →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
                onQuickView={(p) => setQuickViewProduct(p)}
                isWishlisted={wishlistIds.includes(relProduct.id)}
                onToggleWishlist={toggleWishlist}
                onAddToCartDirect={(p) => addToCart(p)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
