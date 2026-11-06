import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Search,
  Check,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../context/ShopContext';

interface ShopPageProps {
  categoryOverride?: string;
  isNewArrivalsOnly?: boolean;
  isBestSellersOnly?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  categoryOverride,
  isNewArrivalsOnly = false,
  isBestSellersOnly = false,
  pageTitle,
  pageSubtitle,
}) => {
  const { products, categories, setQuickViewProduct, addToCart, wishlist, toggleWishlist } = useShop();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.isActive !== false);
  }, [categories]);

  // Normalize category from URL params or props
  const resolvedCategory = useMemo(() => {
    if (categoryOverride) return categoryOverride;
    if (categorySlug) {
      if (categorySlug === 'hijab-scarf') return 'hijab';
      return categorySlug;
    }
    return searchParams.get('category') || 'all';
  }, [categoryOverride, categorySlug, searchParams]);

  // Query param search
  const querySearch = searchParams.get('q') || '';

  // Local state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [activeCategory, setActiveCategory] = useState<string>(resolvedCategory);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(260);
  const [onlySale, setOnlySale] = useState(false);
  const [searchQuery, setSearchQuery] = useState(querySearch);
  const [displayCount, setDisplayCount] = useState(8);

  // Synchronize when URL changes
  useEffect(() => {
    setActiveCategory(resolvedCategory);
  }, [resolvedCategory]);

  useEffect(() => {
    if (querySearch) {
      setSearchQuery(querySearch);
    }
  }, [querySearch]);

  const wishlistIds = wishlist.map((p) => p.id);

  // Extract all available sizes & colors dynamically from products
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => (p?.sizes || []).forEach((s) => set.add(s)));
    return Array.from(set);
  }, [products]);

  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      (p?.colors || []).forEach((c) => {
        if (!map.has(c.name)) {
          map.set(c.name, c.hex);
        }
      });
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p || p.isActive === false) return false;

        // New arrivals or best sellers mode
        if (isNewArrivalsOnly && !p.isNew) return false;
        if (isBestSellersOnly && !p.isBestSeller) return false;

        // Category filter
        if (activeCategory !== 'all' && p.category !== activeCategory) {
          return false;
        }

        // Hide specific product card from Abaya Collection display without deleting database record
        if ((activeCategory === 'abaya' || p.category === 'abaya') && (p.id === 'mc-01' || p.name === 'Zahra Raw Silk Open Abaya')) {
          return false;
        }

        // Price filter
        if (p.price > priceRange) {
          return false;
        }

        // Sale filter
        if (onlySale && !p.isSale) {
          return false;
        }

        // Size filter
        if (selectedSizes.length > 0 && !selectedSizes.some((s) => (p.sizes || []).includes(s))) {
          return false;
        }

        // Color filter
        if (
          selectedColors.length > 0 &&
          !selectedColors.some((colName) => (p.colors || []).some((c) => c.name === colName))
        ) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            (p.name || '').toLowerCase().includes(q) ||
            (p.categoryLabel || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q) ||
            (p.subtitle || '').toLowerCase().includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured
      });
  }, [
    products,
    isNewArrivalsOnly,
    isBestSellersOnly,
    activeCategory,
    priceRange,
    onlySale,
    selectedSizes,
    selectedColors,
    searchQuery,
    sortBy,
  ]);

  const visibleProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(260);
    setOnlySale(false);
    setSearchQuery('');
    setSortBy('featured');
    setDisplayCount(8);
  };

  const activeFiltersCount =
    (activeCategory !== 'all' && !categoryOverride && !categorySlug ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (onlySale ? 1 : 0) +
    (priceRange < 260 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // Dynamic Title Determination
  const currentCategoryObj = categories.find(
    (c) => c.id === activeCategory || c.slug === activeCategory
  );

  const title =
    pageTitle ||
    (isNewArrivalsOnly
      ? 'New Arrivals'
      : isBestSellersOnly
      ? 'Best Sellers'
      : currentCategoryObj
      ? (currentCategoryObj.nameEn || (currentCategoryObj as any).name)
      : 'All Modest Collections');

  const subtitle =
    pageSubtitle ||
    (isNewArrivalsOnly
      ? 'Fresh atelier releases tailored for grace, dignity, and breathable comfort.'
      : isBestSellersOnly
      ? 'Most cherished abayas, hijabs, and dresses loved by women across the USA.'
      : currentCategoryObj
      ? (currentCategoryObj.description || (currentCategoryObj as any).tagline)
      : 'Explore handcrafted abayas, luxury scarves, and modest clothing designed in Dallas, TX.');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Category Header Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-[#FAF0F2] via-[#FCF4F6] to-white border border-[#F4D3D7] p-6 sm:p-10 mb-8 sm:mb-12 shadow-2xs">
        <div className="max-w-3xl space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#2D6A4F] bg-[#EBF5F0] px-2.5 py-0.5 rounded-full">
              Mumtahina’s Closet Inc
            </span>
            {(isNewArrivalsOnly || isBestSellersOnly) && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B2135] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Special Collection
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F1E36]">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Control Bar: Filter Drawer Button, Search, Active Filter Tags, Sorting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#F0E4E6]">
        {/* Left Side: Filter Trigger & Active Filter Count */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            id="open-filter-drawer-btn"
            onClick={() => setFilterDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white border border-[#EADBDE] hover:border-[#2D6A4F] text-xs font-bold uppercase tracking-wider text-[#0F1E36] transition-colors shadow-2xs cursor-pointer flex-shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#2D6A4F]" />
            <span>Filter Catalog</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#2D6A4F] text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-[#E58C9D] flex items-center gap-1 transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear ({activeFiltersCount})</span>
            </button>
          )}

          <span className="text-xs text-slate-500 hidden sm:inline">
            Showing <strong>{filteredProducts.length}</strong> items
          </span>
        </div>

        {/* Right Side: Quick Search & Sorting */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto min-w-0">
          {/* Inline Search Filter */}
          <div className="relative flex-1 min-w-0 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this view..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#EADBDE] rounded-xl text-[#0F1E36] placeholder-slate-400 focus:outline-hidden focus:border-[#2D6A4F] shadow-2xs min-w-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-shrink-0">
            <select
              id="product-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none px-3 py-1.5 pr-7 bg-white border border-[#EADBDE] hover:border-[#2D6A4F] rounded-xl text-xs font-semibold text-[#0F1E36] focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Left Sticky Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-3 space-y-6 bg-white p-5 rounded-2xl border border-[#F0E4E6] shadow-2xs sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5EBED]">
            <h3 className="font-serif text-sm font-bold text-[#0F1E36]">Filters</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-[#2D6A4F] hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Category Filter */}
          {!categoryOverride && !categorySlug && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F1E36] mb-2.5">
                Categories
              </h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    activeCategory === 'all'
                      ? 'bg-[#EBF5F0] text-[#2D6A4F] font-bold'
                      : 'text-slate-600 hover:bg-[#FAF7F6]'
                  }`}
                >
                  <span>All Modest Wear</span>
                  <span className="text-[10px] text-slate-400">{products.length}</span>
                </button>
                {activeCategories.map((cat) => {
                  const count = products.filter(
                    (p) => p.category === cat.id || p.category === cat.slug
                  ).length;
                  const catDisplayName = cat.nameEn || (cat as any).name;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        activeCategory === cat.id
                          ? 'bg-[#EBF5F0] text-[#2D6A4F] font-bold'
                          : 'text-slate-600 hover:bg-[#FAF7F6]'
                      }`}
                    >
                      <span>{catDisplayName}</span>
                      <span className="text-[10px] text-slate-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Filter */}
          <div className="pt-3 border-t border-[#F5EBED]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F1E36] mb-2.5">
              Available Sizes
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {allSizes.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                        : 'bg-white text-slate-700 border-[#EADBDE] hover:border-[#2D6A4F]'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Filter */}
          <div className="pt-3 border-t border-[#F5EBED]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F1E36] mb-2.5">
              Colors
            </h4>
            <div className="flex flex-wrap gap-2">
              {allColors.map((color) => {
                const isSelected = selectedColors.includes(color.name);
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorToggle(color.name)}
                    title={color.name}
                    className={`relative w-6 h-6 rounded-full border shadow-2xs flex items-center justify-center transition-transform hover:scale-110 ${
                      isSelected ? 'ring-2 ring-[#2D6A4F] ring-offset-2' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          color.hex === '#FDFBF7' || color.hex === '#F4D3D7' || color.hex === '#E7D8C9'
                            ? 'text-slate-800'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-3 border-t border-[#F5EBED]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F1E36]">
                Max Price
              </h4>
              <span className="text-xs font-bold text-[#2D6A4F]">${priceRange}</span>
            </div>
            <input
              type="range"
              min="20"
              max="260"
              step="5"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#2D6A4F] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>$20</span>
              <span>$260</span>
            </div>
          </div>

          {/* Sale Toggle */}
          <div className="pt-3 border-t border-[#F5EBED]">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlySale}
                onChange={(e) => setOnlySale(e.target.checked)}
                className="w-4 h-4 rounded text-[#2D6A4F] focus:ring-[#2D6A4F] accent-[#2D6A4F]"
              />
              <span className="text-xs font-semibold text-[#0F1E36]">
                Only Sale Items
              </span>
            </label>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#F0E4E6] space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF0F2] flex items-center justify-center text-[#E58C9D]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0F1E36]">
                No matching garments found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try relaxing your filter criteria or clearing search keywords to view our complete modest collection.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold uppercase tracking-wider"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-6">
                {visibleProducts.map((product) => (
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

              {/* Pagination / Load More */}
              {hasMore && (
                <div className="text-center pt-4 pb-8">
                  <p className="text-xs text-slate-500 mb-3">
                    Showing {visibleProducts.length} of {filteredProducts.length} modest designs
                  </p>
                  <button
                    id="shop-load-more-btn"
                    onClick={() => setDisplayCount((prev) => prev + 6)}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white border border-[#EADBDE] hover:border-[#2D6A4F] text-[#0F1E36] hover:text-[#2D6A4F] text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                  >
                    <span>Load More Products</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setFilterDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-[85vw] sm:max-w-xs w-full bg-white shadow-2xl flex flex-col z-10 p-5 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E4E6]">
              <h3 className="font-serif text-base font-bold text-[#0F1E36]">Filter Products</h3>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Category Selection */}
            {!categoryOverride && !categorySlug && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F1E36] mb-2">
                  Category
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                      activeCategory === 'all'
                        ? 'bg-[#EBF5F0] text-[#2D6A4F] font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    All Modest Wear
                  </button>
                  {activeCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                        activeCategory === cat.id
                          ? 'bg-[#EBF5F0] text-[#2D6A4F] font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      {cat.nameEn || (cat as any).name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Size Selection */}
            <div className="pt-3 border-t border-[#F5EBED]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F1E36] mb-2">
                Sizes
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {allSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      selectedSizes.includes(size)
                        ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                        : 'bg-white text-slate-700 border-[#EADBDE]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Color Selection */}
            <div className="pt-3 border-t border-[#F5EBED]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F1E36] mb-2">
                Colors
              </h4>
              <div className="flex flex-wrap gap-2">
                {allColors.map((color) => {
                  const isSelected = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      onClick={() => handleColorToggle(color.name)}
                      className={`w-7 h-7 rounded-full border shadow-2xs flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-[#2D6A4F] ring-offset-2' : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-slate-800" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Price */}
            <div className="pt-3 border-t border-[#F5EBED]">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-bold">Max Price</span>
                <span className="text-[#2D6A4F] font-bold">${priceRange}</span>
              </div>
              <input
                type="range"
                min="20"
                max="260"
                step="5"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#2D6A4F]"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#F5EBED] flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl border border-[#EADBDE] text-xs font-semibold text-slate-600"
              >
                Reset
              </button>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
