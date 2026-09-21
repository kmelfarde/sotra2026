import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Eye, Layers } from 'lucide-react';
import { OutfitBundle, CurrencyCode, Product } from '../types';

interface OutfitSliderProps {
  bundles: OutfitBundle[];
  productsMap?: Record<string, Product>;
  products?: Product[];
  currency: CurrencyCode;
  currencyRate: number;
  onOpenBundleModal: (bundle: OutfitBundle) => void;
  onSelectProduct?: (product: Product) => void;
  isArabic: boolean;
}

export const OutfitSlider: React.FC<OutfitSliderProps> = ({
  bundles,
  productsMap = {},
  currency,
  currencyRate,
  onOpenBundleModal,
  isArabic
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const formatPrice = (amount: number) => {
    const converted = amount * currencyRate;
    if (currency === 'EGP') return `LE ${amount.toFixed(2)}`;
    if (currency === 'USD') return `$${converted.toFixed(2)}`;
    if (currency === 'SAR') return `${converted.toFixed(2)} SAR`;
    return `${converted.toFixed(2)} AED`;
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    const currentScroll = scrollContainerRef.current.scrollLeft;
    
    // In RTL, scroll direction behavior can vary depending on browser implementation
    const multiplier = direction === 'left' ? -1 : 1;
    scrollContainerRef.current.scrollBy({
      left: multiplier * scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!bundles || bundles.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full py-4">
      {/* Top Controls Bar for Navigation Chevrons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-bold">
            {isArabic ? 'اسحب للتصفح أو استخدم الأسهم' : 'Swipe or use arrows to browse'}
          </span>
        </div>

        {/* Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleScroll(isArabic ? 'right' : 'left')}
            aria-label={isArabic ? 'السابق' : 'Previous'}
            className="w-9 h-9 rounded-full bg-white border border-neutral-300 hover:border-black hover:bg-black hover:text-white text-neutral-800 transition flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
            title={isArabic ? 'السابق' : 'Previous'}
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll(isArabic ? 'left' : 'right')}
            aria-label={isArabic ? 'التالي' : 'Next'}
            className="w-9 h-9 rounded-full bg-white border border-neutral-300 hover:border-black hover:bg-black hover:text-white text-neutral-800 transition flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
            title={isArabic ? 'التالي' : 'Next'}
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Horizontal Uniform Scroll Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x"
      >
        {bundles.map((bundle) => {
          const title = isArabic ? bundle.nameAr || bundle.name : bundle.name || bundle.nameAr;
          const tagline = isArabic ? bundle.taglineAr || bundle.tagline : bundle.tagline || bundle.taglineAr;
          const savings = bundle.originalPrice - bundle.bundlePrice;
          const piecesCount = bundle.productIds ? bundle.productIds.length : 0;

          return (
            <div
              key={bundle.id}
              className="snap-start shrink-0 w-[270px] sm:w-[300px] md:w-[320px] bg-white rounded-xl border border-neutral-200 hover:border-neutral-900 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden group"
            >
              {/* Outfit Image Card with Eye Button Overlay */}
              <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                <img
                  src={bundle.image}
                  alt={title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Badges Overlay */}
                <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex flex-col gap-1 z-10">
                  {bundle.discountPercent > 0 && (
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded shadow-xs">
                      {isArabic ? `خصم ${bundle.discountPercent}%` : `-${bundle.discountPercent}%`}
                    </span>
                  )}
                  {bundle.badge && (
                    <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase rounded shadow-xs">
                      {isArabic && bundle.badgeAr ? bundle.badgeAr : bundle.badge}
                    </span>
                  )}
                </div>

                {piecesCount > 0 && (
                  <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 z-10">
                    <span className="px-2 py-0.5 bg-white/90 backdrop-blur-xs text-neutral-900 text-[10px] font-extrabold rounded border border-neutral-200 shadow-xs flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>{piecesCount} {isArabic ? 'قطع' : 'pcs'}</span>
                    </span>
                  </div>
                )}

                {/* Primary Eye Button for Opening Outfit Modal */}
                <button
                  type="button"
                  onClick={() => onOpenBundleModal(bundle)}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/85 hover:bg-black text-white flex items-center justify-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100 shadow-lg cursor-pointer z-20"
                  title={isArabic ? 'فتح الطقم لتحديد الألوان والمقاسات' : 'View Outfit Details'}
                  aria-label={isArabic ? 'عرض تفاصيل الطقم' : 'View details'}
                >
                  <Eye className="w-5 h-5 text-white" />
                </button>

                {/* Bottom Quick-action Banner */}
                <div
                  onClick={() => onOpenBundleModal(bundle)}
                  className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-center cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5 text-white text-[11px] font-black tracking-wide">
                    <Eye className="w-3.5 h-3.5 text-white" />
                    <span>{isArabic ? 'تحديد الألوان والمقاسات' : 'Choose Sizes & Colors'}</span>
                  </span>
                </div>
              </div>

              {/* Outfit Info Details Below Image */}
              <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 bg-white">
                <div>
                  {tagline && (
                    <span className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1 line-clamp-1">
                      {tagline}
                    </span>
                  )}

                  {/* Name of the Outfit */}
                  <h3
                    onClick={() => onOpenBundleModal(bundle)}
                    className="font-heading font-black text-sm sm:text-base text-neutral-950 hover:underline cursor-pointer mb-2 leading-snug line-clamp-1"
                    title={title}
                  >
                    {title}
                  </h3>
                </div>

                {/* Pricing & Eye CTA Button */}
                <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2 mt-auto">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-heading font-black text-sm sm:text-base text-neutral-950">
                        {formatPrice(bundle.bundlePrice)}
                      </span>
                      {bundle.originalPrice > bundle.bundlePrice && (
                        <span className="text-xs text-neutral-400 line-through">
                          {formatPrice(bundle.originalPrice)}
                        </span>
                      )}
                    </div>
                    {savings > 0 && (
                      <span className="block text-[10px] font-bold text-green-700">
                        {isArabic ? `وفر ${formatPrice(savings)}` : `Save ${formatPrice(savings)}`}
                      </span>
                    )}
                  </div>

                  {/* Eye + Order Button */}
                  <button
                    type="button"
                    onClick={() => onOpenBundleModal(bundle)}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-xs shrink-0 active:scale-95"
                    title={isArabic ? 'معاينة واختيار المقاسات' : 'Configure & Add'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'عرض' : 'View'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
