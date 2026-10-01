import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const WishlistPage: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const navigate = useNavigate();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FAF0F2] text-[#E58C9D] flex items-center justify-center mx-auto mb-6 shadow-xs">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#0F1E36] mb-3">
          Your Wishlist is Empty
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
          Save your favorite abayas, luxury modest dresses, and modal wraps so you can easily review them later.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <span>Explore Modest Boutique</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="border-b border-[#F0E4E6] pb-5 mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
            Saved Garments
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#0F1E36]">
            My Wishlist ({wishlist.length})
          </h1>
        </div>

        <Link
          to="/shop"
          className="text-xs font-semibold text-[#2D6A4F] hover:underline"
        >
          Continue Shopping →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {wishlist.map((product) => (
          <div
            key={product.id}
            id={`wishlist-card-${product.id}`}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              navigate(`/product/${product.id}`);
            }}
            className="group relative flex flex-col bg-white rounded-xl border border-[#F0E4E6] overflow-hidden hover:shadow-md transition-all w-full min-w-0 cursor-pointer"
          >
            <Link
              to={`/product/${product.id}`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) {
                  e.preventDefault();
                }
              }}
              className="relative aspect-[3/4] overflow-hidden bg-[#FAF7F6] cursor-pointer block"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(product);
                }}
                className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-rose-500 shadow-xs transition-colors cursor-pointer"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Link>

            <div className="p-2.5 min-[360px]:p-3 sm:p-4 flex flex-col flex-1 justify-between min-w-0">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] truncate block">
                  {product.categoryLabel}
                </span>
                <Link
                  to={`/product/${product.id}`}
                  className="font-serif text-xs min-[360px]:text-sm font-bold text-[#0F1E36] hover:text-[#2D6A4F] transition-colors truncate block mt-0.5"
                >
                  {product.name}
                </Link>
                <span className="text-xs min-[360px]:text-sm font-bold text-[#0F1E36] block mt-1">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-[#F5EBED] mt-3">
                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-2 px-2 min-[360px]:px-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-lg text-[11px] min-[360px]:text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Move to Bag</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
