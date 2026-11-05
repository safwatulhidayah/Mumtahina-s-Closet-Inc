import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Star, ShoppingBag, Heart, Check, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../types';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  onSelectProduct?: (product: Product) => void;
  onViewFullDetails?: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onSelectProduct,
  onViewFullDetails,
  isWishlisted,
  onToggleWishlist,
}) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Standard');
  const [selectedColor, setSelectedColor] = useState('Original');
  const [quantity, setQuantity] = useState(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const [justHearted, setJustHearted] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedSize(product.sizes?.[0] || 'Standard');
      setSelectedColor(product.colors?.[0]?.name || 'Original');
      setQuantity(1);
    }
  }, [product?.id]);

  if (!product) return null;

  const productImages = product.images || [];
  const productSizes = product.sizes || [];
  const productColors = product.colors || [];

  const handleAddToCart = () => {
    setIsAddedFeedback(true);
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setTimeout(() => {
      setIsAddedFeedback(false);
      onClose();
    }, 450);
  };

  const handleViewDetails = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (onViewFullDetails) {
      onViewFullDetails(product);
    }
    navigate(`/product/${product.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        id="quickview-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        id="quickview-modal-dialog"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 my-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery Column */}
          <div className="bg-[#FAF7F6] p-6 flex flex-col justify-between">
            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-white shadow-xs relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={selectedImage}
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0.7, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0.75 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.05 : 0.25,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="w-full h-full object-cover object-center will-change-transform"
                />
              </AnimatePresence>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-14 h-18 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 cursor-pointer ${
                      selectedImage === idx
                        ? 'border-[#2D6A4F] ring-1 ring-[#2D6A4F] scale-102'
                        : 'border-transparent opacity-70 hover:opacity-100 hover:scale-102'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
                  {product.categoryLabel}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-semibold text-slate-700">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">({product.reviewCount})</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1E36] mb-1">
                {product.name}
              </h2>
              {product.subtitle && (
                <p className="text-xs text-slate-500 mb-3">{product.subtitle}</p>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-[#0F1E36]">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs font-semibold text-[#2D6A4F] bg-[#EBF5F0] px-2 py-0.5 rounded">
                  In Stock ({product.stock} left)
                </span>
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-[#0F1E36] mb-2 flex items-center justify-between">
                    <span>Color: <span className="font-normal text-slate-600">{selectedColor}</span></span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`group relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === c.name ? 'border-[#0F1E36] scale-110 shadow-xs' : 'border-transparent hover:scale-105'
                        }`}
                        title={c.name}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                        {selectedColor === c.name && (
                          <Check className="w-3.5 h-3.5 absolute text-white drop-shadow-sm" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-[#0F1E36] mb-2 flex items-center justify-between">
                    <span>Size: <span className="font-normal text-slate-600">{selectedSize}</span></span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                          selectedSize === s
                            ? 'border-[#2D6A4F] bg-[#2D6A4F] text-white'
                            : 'border-[#E2D5D7] text-[#0F1E36] hover:border-[#2D6A4F] bg-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-semibold text-[#0F1E36]">Quantity:</span>
                <div className="flex items-center border border-[#E2D5D7] rounded-lg bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-sm font-semibold text-slate-600 hover:text-black"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-semibold text-slate-800 min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1 text-sm font-semibold text-slate-600 hover:text-black"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-[#F0E4E6]">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#2D6A4F] hover:bg-[#1B4332] active:scale-[0.98] text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  {isAddedFeedback ? (
                    <>
                      <Check className="w-4 h-4 animate-in zoom-in-95 text-emerald-200" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart • ${(product.price * quantity).toFixed(2)}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setJustHearted(true);
                    setTimeout(() => setJustHearted(false), 500);
                    onToggleWishlist(product);
                  }}
                  className={`p-3 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer ${
                    isWishlisted
                      ? 'border-[#E58C9D] bg-[#FDF0F2] text-[#E58C9D]'
                      : 'border-[#E2D5D7] hover:border-[#E58C9D] text-slate-600 hover:text-[#E58C9D]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isWishlisted ? 'fill-[#E58C9D]' : ''
                    } ${justHearted ? 'animate-heart-pop' : ''}`}
                  />
                </button>
              </div>

              <button
                onClick={handleViewDetails}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#0F1E36] hover:text-[#2D6A4F] transition-colors"
              >
                <span>View Full Product Details & Sizing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  USA Fast Dispatch
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  30-Day Free Returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
