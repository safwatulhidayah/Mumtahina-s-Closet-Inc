import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../context/ShopContext';

export const SearchPage: React.FC = () => {
  const { products, setQuickViewProduct, addToCart, wishlist, toggleWishlist } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlySale, setOnlySale] = useState(false);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const wishlistIds = wishlist.map((p) => p.id);

  const popularSearches = [
    'Silk Abaya',
    'Chiffon Hijab',
    'Open Abaya',
    'Men Kurta',
    'Kids Modest',
    'Magnetic Pins',
    'Emerald Green',
    'Opaque Kaftan',
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery.trim() });
  };

  const handlePopularTagClick = (tag: string) => {
    setSearchQuery(tag);
    setSearchParams({ q: tag });
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Sale filter
      if (onlySale && !p.isSale) {
        return false;
      }
      // Query filter
      if (q) {
        const matchesName = (p.name || '').toLowerCase().includes(q);
        const matchesCategory = (p.categoryLabel || '').toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const matchesSub = (p.subtitle || '').toLowerCase().includes(q);
        return matchesName || matchesCategory || matchesDesc || matchesSub;
      }
      return true;
    });
  }, [products, searchQuery, selectedCategory, onlySale]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Search Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#FAF0F2] via-white to-[#F9EFF1] border border-[#F4D3D7] p-6 sm:p-10 mb-8 sm:mb-12 shadow-2xs">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F] bg-[#EBF5F0] px-3 py-1 rounded-full">
            Storewide Discovery
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F1E36]">
            Search Modest Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Find tailored abayas, non-slip hijabs, coordinates, and modest apparel with ease.
          </p>

          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto pt-2">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, cut, fabric, or color..."
              className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#EADBDE] focus:border-[#2D6A4F] rounded-2xl text-sm text-[#0F1E36] placeholder-slate-400 focus:outline-hidden shadow-sm"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchParams({});
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Popular Search Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#2D6A4F]" /> Trending:
            </span>
            {popularSearches.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handlePopularTagClick(tag)}
                className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-slate-700 hover:text-[#2D6A4F] border border-[#F0E4E6] text-[11px] transition-colors cursor-pointer shadow-2xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Count Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#F0E4E6]">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#0F1E36]">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products in Catalog'}
          </h2>
          <p className="text-xs text-slate-500">
            {filteredProducts.length} items match your search
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#EADBDE] rounded-xl text-xs font-semibold text-[#0F1E36] focus:outline-hidden shadow-2xs"
          >
            <option value="all">All Categories</option>
            <option value="abaya">Abayas</option>
            <option value="women">Women's Dresses</option>
            <option value="hijab">Hijabs & Scarves</option>
            <option value="men">Men's Apparel</option>
            <option value="kids">Kids Modest</option>
            <option value="accessories">Accessories</option>
          </select>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none bg-white px-3 py-1.5 rounded-xl border border-[#EADBDE] shadow-2xs">
            <input
              type="checkbox"
              checked={onlySale}
              onChange={(e) => setOnlySale(e.target.checked)}
              className="rounded text-[#2D6A4F] accent-[#2D6A4F]"
            />
            <span>On Sale</span>
          </label>
        </div>
      </div>

      {/* Search Results Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#F0E4E6] p-8 max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF0F2] flex items-center justify-center text-[#E58C9D]">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#0F1E36]">
            No garments match "{searchQuery}"
          </h3>
          <p className="text-xs text-slate-500">
            Check your spelling, try broader keywords like "abaya", "silk", or browse our curated categories below.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Browse Full Shop
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
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
      )}
    </div>
  );
};
