import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  LayoutGrid,
  Grid2X2,
  Square,
  ChevronLeft,
  ChevronRight,
  Flame,
  ShoppingBag
} from 'lucide-react';
import { Product, CategoryTab, CurrencyCode, OutfitBundle, StoreCategory } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  selectedCategory?: CategoryTab;
  onSelectCategory?: (category: CategoryTab) => void;
  currency: CurrencyCode;
  currencyRate: number;
  onSelectProduct: (product: Product, initialColorId?: string) => void;
  onQuickAdd: (product: Product, colorId: string) => void;
  onOpenFilterDrawer: () => void;
  activeFilterCount?: number;
  bundles?: OutfitBundle[];
  productsMap?: Record<string, Product>;
  onOpenBundleModal?: (bundle: OutfitBundle) => void;
  onSelectProductById?: (productId: string) => void;
  categoriesList?: StoreCategory[];
  isArabic: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory = 'all',
  onSelectCategory = () => {},
  currency,
  currencyRate,
  onSelectProduct,
  onQuickAdd,
  onOpenFilterDrawer,
  activeFilterCount = 0,
  bundles = [],
  productsMap = {},
  onOpenBundleModal = () => {},
  categoriesList = [],
  isArabic
}) => {
  // Grid column layout: '1' (single column on mobile), '2' (standard 2-col on mobile), '3' (3-col)
  const [gridLayout, setGridLayout] = useState<'1' | '2' | '3'>('2');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Reset to page 1 whenever category or filtered product count changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, products.length]);

  // Formatter for prices
  const formatPrice = (amountEGP: number) => {
    const converted = Math.round(amountEGP * currencyRate);
    if (currency === 'EGP') return `${converted} ج.م`;
    if (currency === 'SAR') return `${converted} ر.س`;
    if (currency === 'AED') return `${converted} د.إ`;
    return `$${converted}`;
  };

  // Store departments category tabs - fully dynamic from Firestore
  const categories: { id: CategoryTab; label: string; labelAr: string }[] = categoriesList && categoriesList.length > 0
    ? [
        { id: 'all' as CategoryTab, label: 'View All', labelAr: 'عرض الكل' },
        ...categoriesList
          .filter(c => c.id !== 'all')
          .map(c => ({ id: c.id as CategoryTab, label: c.name, labelAr: c.nameAr }))
      ]
    : [
        { id: 'all' as CategoryTab, label: 'View All', labelAr: 'عرض الكل' }
      ];

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const catalogEl = document.getElementById('products-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Top bundles to feature in the in-feed promotional ad banner
  const featuredInFeedBundles = bundles.slice(0, 3);

  return (
    <section id="products-catalog" className="w-full bg-white py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Headline: منتجاتنا */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-neutral-950 uppercase font-heading">
            {isArabic ? 'منتجاتنا' : 'OUR PRODUCTS'}
          </h2>
        </div>

        {/* Category Horizontal Filter Tabs */}
        <div className="flex items-center space-x-5 overflow-x-auto pb-3 pt-1 border-b border-neutral-200 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`text-xs sm:text-sm whitespace-nowrap font-bold tracking-tight pb-1.5 transition-colors duration-150 cursor-pointer border-b-2 flex items-center space-x-1.5 rtl:space-x-reverse ${
                  isActive
                    ? 'text-black border-black font-extrabold'
                    : 'text-neutral-500 border-transparent hover:text-neutral-800'
                }`}
              >
                <span>{isArabic ? cat.labelAr : cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grid Toolbar: View Switchers & Filter Button (Count removed as requested) */}
        <div className="flex items-center justify-between py-4 border-b border-neutral-100 text-xs sm:text-sm text-neutral-600 mb-6">
          {/* Left: Grid Layout Switchers */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setGridLayout('1')}
              aria-label="Single column view"
              className={`p-1.5 rounded transition ${
                gridLayout === '1' ? 'text-black bg-neutral-100' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <Square className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              onClick={() => setGridLayout('2')}
              aria-label="2 columns view"
              className={`p-1.5 rounded transition ${
                gridLayout === '2' ? 'text-black bg-neutral-100' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <Grid2X2 className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              onClick={() => setGridLayout('3')}
              aria-label="3 columns compact view"
              className={`p-1.5 rounded transition ${
                gridLayout === '3' ? 'text-black bg-neutral-100' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          {/* Right: Filter & Sort Button with badge if active */}
          <button
            onClick={onOpenFilterDrawer}
            className="flex items-center space-x-1.5 font-bold text-neutral-900 hover:text-black py-1 px-2.5 rounded-sm hover:bg-neutral-100 transition cursor-pointer"
          >
            <span>{isArabic ? 'تصفية وترتيب' : 'Filter & Sort'}</span>
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2]" />
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full ml-1">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* CATALOG VIEW */}
        {products.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900 mb-2 font-heading">
              {isArabic ? 'المتجر جاهز لاستقبال المنتجات' : 'STORE READY FOR PRODUCTS'}
            </h3>
            <p className="text-xs text-neutral-500 mb-4 font-sans leading-relaxed">
              {isArabic
                ? 'تم إخلاء المتجر وقواعد البيانات من كافة البيانات التجريبية بنجاح. كافة الصلاحيات والحسابات جاهزة للاستخدام وإضافة المنتجات الحقيقية مباشرة عبر لوحة تحكم الإدارة.'
                : 'All demo data has been cleared from code and database. The system, users, and roles are fully operational and ready for your real products via the Admin Dashboard.'}
            </p>
          </div>
        ) : (
          <>
            <div
              className={`grid gap-x-3 sm:gap-x-5 gap-y-8 sm:gap-y-10 ${
                gridLayout === '1'
                  ? 'grid-cols-1 max-w-lg mx-auto'
                  : gridLayout === '2'
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
              }`}
            >
              {paginatedProducts.map((product, index) => (
                <React.Fragment key={product.id}>
                  {/* Standard Product Card */}
                  <ProductCard
                    product={product}
                    currency={currency}
                    currencyRate={currencyRate}
                    onSelectProduct={onSelectProduct}
                    onQuickAdd={onQuickAdd}
                    isArabic={isArabic}
                  />

                  {/* EMBEDDED IN-FEED PROMOTIONAL AD: العروض الترويجية والأطقم الخاصة (تنسيقات سوترة الحصرية) */}
                  {index === 3 && featuredInFeedBundles.length > 0 && (
                    <div
                      key="in-feed-promo-ad-banner"
                      className="col-span-full my-4 sm:my-8 rounded-xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-4 sm:p-7 border border-neutral-800 shadow-2xl relative overflow-hidden"
                    >
                      {/* Ambient background glow accents */}
                      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full filter blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full filter blur-2xl pointer-events-none" />

                      {/* Header of the In-Feed Ad Banner */}
                      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-5 gap-3 pb-3 border-b border-neutral-800/80">
                        <div>
                          <div className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-red-400 font-black text-[11px] uppercase tracking-widest mb-1">
                            <Flame className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse" />
                            <span>{isArabic ? 'العروض الترويجية والأطقم الخاصة' : 'SPECIAL PROMOTIONS & OUTFIT DEALS'}</span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-heading">
                            {isArabic ? 'تنسيقات سوترة الحصرية' : 'EXCLUSIVE SOTRA SETS & OFFERS'}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans leading-relaxed">
                            {isArabic
                              ? 'أطقم وتنسيقات رجالية متكاملة بخصومات استثنائية مع إمكانية تحديد مقاس ولون كل قطعة حسب رغبتك.'
                              : 'Complete menswear outfits with exclusive bundle savings. Choose your custom size & color for each item.'}
                          </p>
                        </div>
                      </div>

                      {/* Top Featured Bundles inside the In-Feed Ad Banner */}
                      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {featuredInFeedBundles.map((b: OutfitBundle) => {
                          const pieces = b.productIds.map((id: string) => productsMap[id]).filter(Boolean);

                          return (
                            <div
                              key={b.id}
                              onClick={() => onOpenBundleModal(b)}
                              className="group bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-red-600/70 rounded-lg overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-md"
                            >
                              {/* Bundle Outfit Image */}
                              <div className="relative aspect-[4/3] bg-neutral-950 overflow-hidden">
                                <img
                                  src={b.image}
                                  alt={isArabic ? b.nameAr : b.name}
                                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                                <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 z-10">
                                  <span className="bg-red-600 text-white text-[10px] font-black tracking-wider px-2 py-0.5 uppercase rounded-xs shadow-md">
                                    {isArabic ? `خصم ${b.discountPercent}%` : `SAVE ${b.discountPercent}%`}
                                  </span>
                                </div>
                                <div className="absolute bottom-2 right-2 rtl:right-auto rtl:left-2 z-10">
                                  <span className="bg-black/75 backdrop-blur-xs text-neutral-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    {isArabic ? `${b.productIds.length} قطع متناسقة` : `${b.productIds.length} items`}
                                  </span>
                                </div>
                              </div>

                              {/* Bundle Content */}
                              <div className="p-3.5 flex flex-col justify-between flex-1">
                                <div>
                                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white mb-1 line-clamp-1 group-hover:text-red-400 transition font-heading">
                                    {isArabic ? b.nameAr : b.name}
                                  </h4>
                                  <p className="text-[11px] text-neutral-400 line-clamp-1 mb-2 font-sans">
                                    {isArabic ? b.taglineAr : b.tagline}
                                  </p>

                                  {/* Included pieces mini preview */}
                                  {pieces.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {pieces.map((p: Product) => (
                                        <span
                                          key={p.id}
                                          className="text-[9px] font-semibold text-neutral-300 bg-neutral-800/80 px-1.5 py-0.5 rounded truncate max-w-full"
                                        >
                                          ✓ {isArabic && p.nameAr ? p.nameAr : p.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Bundle Price & Customize Button */}
                                <div className="pt-2 border-t border-neutral-800/90 flex items-center justify-between mt-auto">
                                  <div>
                                    <span className="text-[11px] text-neutral-400 line-through mr-1.5">
                                      {formatPrice(b.originalPrice)}
                                    </span>
                                    <span className="text-xs sm:text-sm font-black text-white">
                                      {formatPrice(b.bundlePrice)}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenBundleModal(b);
                                    }}
                                    className="px-2.5 py-1.5 bg-white text-black hover:bg-red-600 hover:text-white rounded text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                                  >
                                    {isArabic ? 'تخصيص وطلب' : 'Customize'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-neutral-600 font-bold">
                  {isArabic
                    ? `الصفحة ${currentPage} من ${totalPages}`
                    : `Page ${currentPage} of ${totalPages}`}
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-xs font-black uppercase rounded border border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white hover:border-black transition flex items-center space-x-1 rtl:space-x-reverse cursor-pointer bg-white"
                  >
                    {isArabic ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                    <span>{isArabic ? 'السابق' : 'Previous'}</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 text-xs font-black rounded transition cursor-pointer flex items-center justify-center ${
                            isActive
                              ? 'bg-black text-white shadow-sm'
                              : 'bg-neutral-50 border border-neutral-200 text-neutral-800 hover:bg-neutral-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-xs font-black uppercase rounded border border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white hover:border-black transition flex items-center space-x-1 rtl:space-x-reverse cursor-pointer bg-white"
                  >
                    <span>{isArabic ? 'التالي' : 'Next'}</span>
                    {isArabic ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
