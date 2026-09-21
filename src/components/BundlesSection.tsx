import React from 'react';
import { Layers, ArrowLeft, ArrowRight } from 'lucide-react';
import { OutfitBundle, Product, CurrencyCode, CategoryTab, StoreCategory } from '../types';
import { BundleCard } from './BundleCard';

interface BundlesSectionProps {
  bundles: OutfitBundle[];
  productsMap: Record<string, Product>;
  currency: CurrencyCode;
  currencyRate: number;
  onOpenBundleModal?: (bundle: OutfitBundle) => void;
  onSelectBundle?: (bundle: OutfitBundle) => void;
  isArabic: boolean;
  isStandalonePage?: boolean;
  onBackToShop?: () => void;
  onChangeCategory?: (cat: CategoryTab) => void;
  categories?: StoreCategory[];
}

export const BundlesSection: React.FC<BundlesSectionProps> = ({
  bundles,
  productsMap,
  currency,
  currencyRate,
  onOpenBundleModal,
  onSelectBundle,
  isArabic,
  isStandalonePage = false,
  onBackToShop,
  onChangeCategory,
  categories = []
}) => {
  const handleOpenBundle = onSelectBundle || onOpenBundleModal || (() => {});
  return (
    <div id="bundles-section" className="w-full bg-white min-h-screen">
      {/* If Standalone Category Page, show hero banner */}
      {isStandalonePage && (
        <div className="relative w-full bg-neutral-950 text-white py-12 sm:py-16 md:py-20 overflow-hidden border-b border-neutral-900">
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src="https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?q=80&w=900&auto=format&fit=crop"
              alt="Sets"
              className="w-full h-full object-cover object-center filter blur-xs"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent z-0" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
            {onBackToShop && (
              <button
                onClick={onBackToShop}
                className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white mb-6 transition cursor-pointer"
              >
                {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{isArabic ? 'الرئيسية / جميع الأقسام' : 'Home / All Categories'}</span>
              </button>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-red-500 block mb-2">
                  {isArabic ? 'تنسيقات وأطقم سوترة الحصرية' : 'EXCLUSIVE SOTRA SETS & BUNDLES'}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-heading">
                  {isArabic ? 'قسم الأطقم والتنسيقات' : 'OUTFIT SETS & BUNDLES'}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-2xl leading-relaxed">
                  {isArabic
                    ? 'أطقم ملابس وتنسيقات متناسقة مع إمكانية تحديد مقاس ولون كل قطعة داخل الطقم بخصم خاص.'
                    : 'Curated coordinated sets with custom size and color selection for each item.'}
                </p>
              </div>

              <div className="shrink-0 bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20 text-xs font-black uppercase tracking-wider self-start md:self-auto">
                {isArabic ? `${bundles.length} أطقم متاحة` : `${bundles.length} BUNDLE SETS`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Horizontal Quick Switch Bar if standalone */}
      {isStandalonePage && onChangeCategory && categories && categories.length > 0 && (
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto py-3 no-scrollbar">
              {categories.map((cat) => {
                const isActive = cat.id === 'sets';
                return (
                  <button
                    key={cat.id}
                    onClick={() => onChangeCategory(cat.id as CategoryTab)}
                    className={`text-xs sm:text-sm whitespace-nowrap font-black uppercase tracking-wider pb-1 transition-all cursor-pointer border-b-2 ${
                      isActive
                        ? 'text-black border-black scale-105'
                        : 'text-neutral-500 border-transparent hover:text-black'
                    }`}
                  >
                    {isArabic ? cat.nameAr : cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bundles Grid - 2 items per row as requested */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {bundles.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              <Layers className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900 mb-2 font-heading">
              {isArabic ? 'لا توجد أطقم معروضة حالياً' : 'NO OUTFIT SETS FOUND'}
            </h3>
            <p className="text-xs text-neutral-500 font-sans leading-relaxed">
              {isArabic
                ? 'المتجر مصفر حالياً. يمكنك إضافة وتنسيق الأطقم من لوحة تحكم الإدارة ليتم حفظها مباشرة في فايربيس (Firebase).'
                : 'The store is zeroed out. You can create and coordinate outfit sets directly from the Admin Dashboard, which syncs them to Firebase.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {bundles.map((bundle) => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                productsMap={productsMap}
                currency={currency}
                currencyRate={currencyRate}
                onOpenBundleModal={handleOpenBundle}
                isArabic={isArabic}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
