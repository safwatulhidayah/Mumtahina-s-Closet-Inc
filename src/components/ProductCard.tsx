import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, Star, ShoppingBag, Share2, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ThreeDotMenu, ThreeDotMenuItem } from './ThreeDotMenu';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
  onSelectProduct?: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCartDirect?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onQuickView,
  isWishlisted,
  onToggleWishlist,
  onAddToCartDirect,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useShop();

  const handleShare = () => {
    if (navigator.clipboard) {
      const url = `${window.location.origin}/product/${product.id}`;
      navigator.clipboard.writeText(url);
      addToast(`Copied link to ${product.name}!`, 'info');
    }
  };

  const productMenuItems: ThreeDotMenuItem[] = [
    {
      id: 'quick-view',
      label: 'Quick View',
      icon: Eye,
      onClick: () => onQuickView(product),
    },
    {
      id: 'quick-cart',
      label: 'Add to Cart',
      icon: ShoppingBag,
      onClick: () => {
        if (onAddToCartDirect) {
          onAddToCartDirect(product);
        } else {
          onQuickView(product);
        }
      },
    },
    {
      id: 'wishlist-toggle',
      label: isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist',
      icon: Heart,
      onClick: () => onToggleWishlist(product),
    },
    {
      id: 'view-details',
      label: 'Full Product Details',
      icon: ArrowRight,
      to: `/product/${product.id}`,
    },
    {
      id: 'share-link',
      label: 'Share Modest Look',
      icon: Share2,
      onClick: handleShare,
    },
  ];

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleCardClick = (e?: React.MouseEvent) => {
    if (e) {
      const target = e.target as HTMLElement;
      if (target.closest('button, [role="button"], [data-stop-propagation="true"]')) {
        return;
      }
    }
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-xl border border-[#F0E4E6] overflow-hidden hover:border-[#2D6A4F]/40 hover:shadow-md transition-all duration-300 w-full min-w-0 cursor-pointer"
      onMouseEnter={() => {
        setIsHovered(true);
        if (product.images.length > 1) {
          setCurrentImageIndex(1);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      {/* Product Image Stage */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF7F6] cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges Container */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isSale && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#E58C9D] text-white shadow-2xs">
              Sale -{discountPercent}%
            </span>
          )}
          {product.isNew && !product.isSale && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#2D6A4F] text-white shadow-2xs">
              New Arrival
            </span>
          )}
          {product.isBestSeller && !product.isSale && !product.isNew && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#0F1E36] text-white shadow-2xs">
              Best Seller
            </span>
          )}
        </div>

        {/* Top Right Actions: 3-Dot More Menu & Wishlist Button */}
        <div
          className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <ThreeDotMenu
            id={`product-more-btn-${product.id}`}
            ariaLabel={`More options for ${product.name}`}
            buttonSize="sm"
            buttonClassName="bg-white/80 backdrop-blur-xs text-[#0F1E36] hover:bg-white hover:text-[#2D6A4F] shadow-2xs"
            items={productMenuItems}
          />
          <button
            id={`wishlist-toggle-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-1.5 rounded-full backdrop-blur-xs transition-colors shadow-2xs cursor-pointer ${
              isWishlisted
                ? 'bg-white text-[#E58C9D]'
                : 'bg-white/80 text-[#0F1E36] hover:bg-white hover:text-[#E58C9D]'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#E58C9D]' : ''}`} />
          </button>
        </div>

        {/* Quick View Button Hover Overlay on Desktop */}
        <div className="absolute inset-x-2.5 bottom-2.5 hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none group-hover:pointer-events-auto">
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white/95 hover:bg-[#0F1E36] hover:text-white text-[#0F1E36] rounded-lg text-xs font-semibold shadow-sm transition-colors backdrop-blur-xs cursor-pointer pointer-events-auto"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
          {onAddToCartDirect && (
            <button
              id={`quick-add-btn-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCartDirect(product);
              }}
              className="p-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-lg shadow-sm transition-colors cursor-pointer pointer-events-auto"
              title="Add to Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 min-[360px]:p-3 sm:p-4 flex flex-col flex-1 justify-between bg-white min-w-0">
        <div className="min-w-0">
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 mb-1 min-w-0">
            <span className="text-[10px] min-[360px]:text-[11px] font-semibold uppercase tracking-wider text-[#2D6A4F] truncate">
              {product.categoryLabel}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="text-[10px] min-[360px]:text-[11px] font-medium text-slate-700">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[9px] min-[360px]:text-[10px] text-slate-400">
                ({product.reviewCount})
              </span>
            </div>
          </div>

          {/* Product Name */}
          <Link
            to={`/product/${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick(e);
            }}
            className="font-serif text-xs min-[360px]:text-sm sm:text-base font-semibold text-[#0F1E36] hover:text-[#2D6A4F] transition-colors line-clamp-1 cursor-pointer block"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 mb-2.5 flex-wrap">
              {product.colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full border border-slate-300 shadow-2xs flex-shrink-0"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-slate-400 font-medium">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Mobile Quick Action */}
        <div className="pt-2 border-t border-[#F7EFF1] flex items-center justify-between gap-1 min-w-0">
          <div className="flex items-baseline gap-1 min-[360px]:gap-2 min-w-0 flex-wrap">
            <span className="text-xs min-[360px]:text-sm sm:text-base font-bold text-[#0F1E36]">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] min-[360px]:text-xs text-slate-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Mobile Quick View Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="sm:hidden text-[10px] min-[360px]:text-[11px] font-semibold text-[#2D6A4F] bg-[#EBF5F0] hover:bg-[#2D6A4F] hover:text-white px-2 py-1 rounded transition-colors flex-shrink-0 cursor-pointer"
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};
