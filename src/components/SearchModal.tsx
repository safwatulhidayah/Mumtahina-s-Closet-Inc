import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onSearchSubmit?: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products = [],
  onSelectProduct,
  onSearchSubmit,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const safeProducts = Array.isArray(products) ? products : [];
  const filtered = query.trim()
    ? safeProducts.filter(
        (p) =>
          (p?.name || '').toLowerCase().includes(query.toLowerCase()) ||
          (p?.categoryLabel || '').toLowerCase().includes(query.toLowerCase()) ||
          (p?.description || '').toLowerCase().includes(query.toLowerCase()) ||
          (p?.colors || []).some((c) => (c?.name || '').toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const trendingTags = ['Silk Abaya', 'Modal Hijab', 'Pleated Dress', 'Magnetic Pins', 'Men Kurta', 'Blush Pink'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearchSubmit) {
        onSearchSubmit(query.trim());
      }
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleProductClick = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    navigate(`/product/${product.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
      <div
        id="search-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div
        id="search-dialog"
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#F0E4E6] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="relative border-b border-[#F0E4E6] p-4 sm:p-5 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modest wear by name, fabric, style..."
            className="w-full text-sm sm:text-base text-[#0F1E36] placeholder-slate-400 focus:outline-hidden bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-[#0F1E36] px-2 py-1"
          >
            Esc
          </button>
        </form>

        {/* Results / Suggestions Stage */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* Trending Searches when no query */}
          {!query.trim() ? (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-[#2D6A4F]" />
                Trending Modest Searches
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      navigate(`/search?q=${encodeURIComponent(tag)}`);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-[#FAF0F2] text-xs font-semibold text-[#0F1E36] hover:bg-[#2D6A4F] hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Featured Collections
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {products.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleProductClick(p)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#FAF7F6] border border-transparent hover:border-[#F0E4E6] cursor-pointer transition-colors"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-[#0F1E36] truncate">{p.name}</p>
                      <p className="text-[11px] text-[#2D6A4F] font-bold">${p.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filtered.length > 0 ? (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>{filtered.length} products found for "{query}"</span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="font-semibold text-[#2D6A4F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View all results <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="divide-y divide-[#F0E4E6]">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-[#FAF7F6] px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-16 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F]">
                          {product.categoryLabel}
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-[#0F1E36] truncate">
                          {product.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {product.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold text-[#0F1E36]">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="block text-[11px] text-slate-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-semibold text-[#0F1E36]">
                No modest styles found for "{query}"
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for terms like "abaya", "silk", "linen", or browse our curated collections.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
