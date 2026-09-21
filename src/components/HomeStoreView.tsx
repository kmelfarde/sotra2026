import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, LayoutGrid, SlidersHorizontal, Flame, Compass, ShoppingBag, Sparkles, Layers, ArrowUpRight, Eye } from 'lucide-react';
import { Product, OutfitBundle, CurrencyCode, CategoryTab, StoreCategory, HeroBannerSettings } from '../types';
import { ProductCard } from './ProductCard';
import { CategoryCarousel } from './CategoryCarousel';
import { ProductGrid } from './ProductGrid';
import { OutfitSlider } from './OutfitSlider';

interface HomeStoreViewProps {
  products: Product[];
  filteredProducts?: Product[];
  selectedCategory?: CategoryTab;
  onSelectCategory?: (category: CategoryTab) => void;
  bundles?: OutfitBundle[];
  productsMap?: Record<string, Product>;
  currency: CurrencyCode;
  currencyRate: number;
  onSelectProduct: (product: Product, initialColorId?: string) => void;
  onQuickAdd: (product: Product, colorId: string) => void;
  onOpenBundleModal?: (bundle: OutfitBundle) => void;
  onOpenFilterDrawer?: () => void;
  activeFilterCount?: number;
  onOpenCategory?: (category: CategoryTab) => void;
  onViewAllCategory?: (category: any) => void;
  onOpenBundleById?: (bundleId: string) => void;
  onShopAll?: () => void;
  onNewArrivals?: () => void;
  categories?: StoreCategory[];
  shopByCategoryTiles?: StoreCategory[];
  heroBanner?: HeroBannerSettings;
  isArabic: boolean;
}

export const HomeStoreView: React.FC<HomeStoreViewProps> = ({
  products,
  filteredProducts = products,
  selectedCategory = 'all',
  onSelectCategory = () => {},
  bundles = [],
  productsMap = {},
  currency,
  currencyRate,
  onSelectProduct,
  onQuickAdd,
  onOpenBundleModal = () => {},
  onOpenFilterDrawer = () => {},
  activeFilterCount = 0,
  onOpenCategory,
  onViewAllCategory,
  onOpenBundleById,
  onShopAll = () => {},
  onNewArrivals = () => {},
  categories,
  shopByCategoryTiles,
  heroBanner,
  isArabic
}) => {
  const handleCategoryNav = onOpenCategory || onViewAllCategory || onSelectCategory;

  // Images that rotate dynamically based on Admin settings
  const bannerImages = (heroBanner?.images && heroBanner.images.length > 0)
    ? heroBanner.images.filter(Boolean)
    : (heroBanner?.slides && heroBanner.slides.length > 0)
    ? heroBanner.slides.map((s) => s.imageUrl).filter(Boolean)
    : [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1600&auto=format&fit=crop'
      ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const intervalTime = (heroBanner?.rotationSeconds || 3) * 1000;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [bannerImages.length, heroBanner?.rotationSeconds]);

  // 1. New Arrivals: Products explicitly marked with showInNewArrivals / isNewArrival, or fallback to latest
  const newArrivals = (() => {
    const featured = products.filter((p) => p.showInNewArrivals === true || p.isNewArrival === true);
    if (featured.length > 0) return featured.slice(0, 8);
    return products.slice(0, 4);
  })();

  // 2. Best Sellers: Products explicitly marked with showInBestSellers, or top rated products
  const bestSellers = (() => {
    const featured = products.filter((p) => p.showInBestSellers === true);
    if (featured.length > 0) return featured.slice(0, 8);
    return [...products]
      .sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
      .slice(0, 4);
  })();

  // 3. Category Style Tiles (2x2 visual cards) - Dynamically from Admin
  const categoryTiles = (shopByCategoryTiles && shopByCategoryTiles.length > 0)
    ? shopByCategoryTiles.map((c) => ({
        id: c.id as CategoryTab,
        name: c.name.toUpperCase(),
        nameAr: c.nameAr,
        image: c.image
      }))
    : [];

  const formatPrice = (amount: number) => {
    const converted = amount * currencyRate;
    if (currency === 'EGP') return `LE ${amount.toFixed(2)}`;
    if (currency === 'USD') return `$${converted.toFixed(2)}`;
    if (currency === 'SAR') return `${converted.toFixed(2)} SAR`;
    return `${converted.toFixed(2)} AED`;
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full bg-white text-neutral-900 pb-16">
      {/* 1. HERO BANNER: 3 images rotating every 3s, clear with no dark shading overlay, with harmonious in-banner navigation dock */}
      <section className="relative w-full bg-neutral-100 overflow-hidden select-none">
        <div className="relative min-h-[420px] sm:min-h-[480px] md:min-h-[560px] w-full">
          {/* Background Rotating Images (Clear & No dark shading) */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {bannerImages.map((imgSrc, idx) => (
              <img
                key={idx}
                src={imgSrc}
                alt="SOTRA"
                className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out ${
                  idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              />
            ))}
          </div>

          {/* Dots Indicator (Top Right or Centered Bottom) */}
          <div className="absolute top-4 right-4 z-20 flex space-x-1.5 rtl:space-x-reverse bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20">
            {bannerImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide ? 'w-5 bg-white shadow-md' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Harmonious In-Banner Navigation Dock (وصل حديثاً | الأقسام | جميع المنتجات) */}
          {heroBanner?.showDock !== false && (
            <div className="absolute bottom-5 sm:bottom-7 inset-x-0 z-20 flex justify-center px-3 sm:px-6 pointer-events-auto">
              <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse bg-black/60 hover:bg-black/75 backdrop-blur-md border border-white/25 p-1.5 sm:p-2 rounded-full shadow-2xl transition-all max-w-full overflow-x-auto no-scrollbar">
                {/* 1. وصل حديثاً */}
                <button
                  type="button"
                  onClick={() => scrollToSection('new-arrivals-section')}
                  className="group flex items-center justify-center px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-white hover:bg-white hover:text-black transition-all duration-200 text-xs sm:text-sm font-black uppercase tracking-wider cursor-pointer whitespace-nowrap"
                >
                  <span>{isArabic ? 'وصل حديثاً' : 'New Arrivals'}</span>
                </button>

                {/* Divider */}
                <span className="w-px h-4 bg-white/20" />

                {/* 2. الأقسام */}
                <button
                  type="button"
                  onClick={() => scrollToSection('quick-categories-carousel')}
                  className="group flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-white hover:bg-white hover:text-black transition-all duration-200 text-xs sm:text-sm font-black uppercase tracking-wider cursor-pointer whitespace-nowrap"
                >
                  <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:text-black shrink-0" />
                  <span>{isArabic ? 'الأقسام' : 'Categories'}</span>
                </button>

                {/* Divider */}
                <span className="w-px h-4 bg-white/20" />

                {/* 3. جميع المنتجات */}
                <button
                  type="button"
                  onClick={() => scrollToSection('all-products-catalog')}
                  className="group flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-white hover:bg-white hover:text-black transition-all duration-200 text-xs sm:text-sm font-black uppercase tracking-wider cursor-pointer whitespace-nowrap"
                >
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:text-black shrink-0" />
                  <span>{isArabic ? 'جميع المنتجات' : 'All Products'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. CATEGORY HORIZONTAL CAROUSEL (من التصميم المعتمد للتصفح السريع) */}
      <div id="quick-categories-carousel">
        <CategoryCarousel
          selectedCategory={selectedCategory}
          categories={categories}
          onSelectCategory={(cat) => {
            onSelectCategory(cat);
            scrollToSection('all-products-catalog');
          }}
          isArabic={isArabic}
        />
      </div>

      {/* 3. SECTION: NEW ARRIVALS (وصل حديثاً) - Controlled via Admin */}
      {heroBanner?.showNewArrivals !== false && newArrivals.length > 0 && (
        <section id="new-arrivals-section" className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-100">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-neutral-950 font-heading">
              {isArabic
                ? (heroBanner?.newArrivalsTitleAr || 'وصل حديثاً')
                : (heroBanner?.newArrivalsTitleEn || 'NEW ARRIVALS')}
            </h2>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                scrollToSection('all-products-catalog');
              }}
              className="text-xs sm:text-sm font-bold text-neutral-600 hover:text-black flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{isArabic ? 'عرض الكل' : 'See All'}</span>
              {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* 2-Column Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {newArrivals.map((prod) => (
              <ProductCard
                key={`new-${prod.id}`}
                product={prod}
                currency={currency}
                currencyRate={currencyRate}
                onSelectProduct={onSelectProduct}
                onQuickAdd={onQuickAdd}
                isArabic={isArabic}
              />
            ))}
          </div>

          {/* View All Button pointing to all products */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                scrollToSection('all-products-catalog');
              }}
              className="inline-block text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 hover:text-black border-b-2 border-neutral-900 pb-0.5 transition cursor-pointer"
            >
              {isArabic ? 'عرض جميع المنتجات' : 'View all products'}
            </button>
          </div>
        </section>
      )}

      {/* 4. SECTION: BEST SELLERS (الأكثر مبيعاً) - Controlled via Admin */}
      {heroBanner?.showBestSellers !== false && bestSellers.length > 0 && (
        <section id="best-sellers-section" className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-100">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-neutral-950 font-heading">
              {isArabic
                ? (heroBanner?.bestSellersTitleAr || 'الأكثر مبيعاً')
                : (heroBanner?.bestSellersTitleEn || 'BEST SELLERS')}
            </h2>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                scrollToSection('all-products-catalog');
              }}
              className="text-xs sm:text-sm font-bold text-neutral-600 hover:text-black flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{isArabic ? 'عرض الكل' : 'See All'}</span>
              {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* 2-Column Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {bestSellers.map((prod) => (
              <ProductCard
                key={`best-${prod.id}`}
                product={prod}
                currency={currency}
                currencyRate={currencyRate}
                onSelectProduct={onSelectProduct}
                onQuickAdd={onQuickAdd}
                isArabic={isArabic}
              />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                scrollToSection('all-products-catalog');
              }}
              className="inline-block text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 hover:text-black border-b-2 border-neutral-900 pb-0.5 transition cursor-pointer"
            >
              {isArabic ? 'عرض جميع المنتجات' : 'View all products'}
            </button>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION: SOTRA LOOKS & CURATED OUTFITS (قسم الإطلالات والأطقم بالصفحة الرئيسية مع جرار 3D) */}
      {/* ========================================================= */}
      {bundles && bundles.length > 0 && (
        <section id="looks-and-outfits-section" className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 pb-3 border-b border-neutral-200 gap-3">
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
                <span className="text-[11px] font-black uppercase tracking-widest text-neutral-500">
                  {isArabic ? 'إطلالات وتنسيقات سوترة' : 'SOTRA LOOKS & OUTFITS'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-neutral-950 font-heading">
                {isArabic ? 'قسم الإطلالات والأطقم المتكاملة' : 'CURATED LOOKS & OUTFITS'}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold px-3 py-1 bg-neutral-100 text-neutral-800 rounded-full border border-neutral-200">
                {bundles.length} {isArabic ? 'أطقم متكاملة' : 'Outfits'}
              </span>
            </div>
          </div>

          {/* Clean Horizontal Outfits Slider with Eye preview button & uniform cards */}
          <OutfitSlider
            bundles={bundles}
            productsMap={productsMap}
            products={products}
            currency={currency}
            currencyRate={currencyRate}
            onOpenBundleModal={onOpenBundleModal}
            onSelectProduct={onSelectProduct}
            isArabic={isArabic}
          />
        </section>
      )}

      {/* 5. SECTION: SHOP BY CATEGORY (تسوق حسب الأقسام) - Controlled via Admin */}
      {heroBanner?.showShopByCategory !== false && categoryTiles.length > 0 && (
        <section id="categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-100">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-neutral-950 font-heading">
              {isArabic
                ? (heroBanner?.shopByCategoryTitleAr || 'تسوق حسب الأقسام')
                : (heroBanner?.shopByCategoryTitleEn || 'SHOP BY CATEGORY')}
            </h2>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                scrollToSection('quick-categories-carousel');
              }}
              className="text-xs sm:text-sm font-bold text-neutral-600 hover:text-black flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{isArabic ? 'عرض الكل' : 'See All'}</span>
              {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* 2x2 Category Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {categoryTiles.map((tile) => (
              <div
                key={tile.id}
                onClick={() => {
                  handleCategoryNav(tile.id as any);
                }}
                className="group relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-neutral-100 rounded-lg sm:rounded-xl cursor-pointer shadow-sm"
              >
                <img
                  src={tile.image}
                  alt={tile.name}
                  className="w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Title at Bottom */}
                <div className="absolute bottom-3 sm:bottom-4 inset-x-0 text-center px-2">
                  <span className="text-sm sm:text-lg font-black uppercase tracking-wider text-white font-heading drop-shadow-md">
                    {isArabic ? tile.nameAr : tile.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. COMPLETE INTEGRATED CATALOG (جميع المنتجات والكتالوج الشامل مع إعلانات التنسيقات والعروض الترويجية المدمجة) */}
      <div id="all-products-catalog" className="pt-8 sm:pt-12">
        <ProductGrid
          products={filteredProducts}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          currency={currency}
          currencyRate={currencyRate}
          onSelectProduct={onSelectProduct}
          onQuickAdd={onQuickAdd}
          onOpenFilterDrawer={onOpenFilterDrawer}
          activeFilterCount={activeFilterCount}
          bundles={bundles}
          productsMap={productsMap}
          onOpenBundleModal={(bundle) => onOpenBundleModal(bundle)}
          categoriesList={categories}
          isArabic={isArabic}
        />
      </div>
    </div>
  );
};
