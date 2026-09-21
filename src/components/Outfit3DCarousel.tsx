import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Eye, ArrowUpRight, Layers } from 'lucide-react';
import { OutfitBundle, CurrencyCode, Product } from '../types';

interface Outfit3DCarouselProps {
  bundles: OutfitBundle[];
  productsMap?: Record<string, Product>;
  products?: Product[];
  currency: CurrencyCode;
  currencyRate: number;
  onOpenBundleModal: (bundle: OutfitBundle) => void;
  onSelectProduct?: (product: Product) => void;
  isArabic: boolean;
}

export const Outfit3DCarousel: React.FC<Outfit3DCarouselProps> = ({
  bundles,
  productsMap = {},
  products = [],
  currency,
  currencyRate,
  onOpenBundleModal,
  onSelectProduct,
  isArabic
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Keep active index within bounds if bundles change
  useEffect(() => {
    if (activeIndex >= bundles.length) {
      setActiveIndex(Math.max(0, bundles.length - 1));
    }
  }, [bundles.length, activeIndex]);

  const formatPrice = (amount: number) => {
    const converted = amount * currencyRate;
    if (currency === 'EGP') return `LE ${amount.toFixed(2)}`;
    if (currency === 'USD') return `$${converted.toFixed(2)}`;
    if (currency === 'SAR') return `${converted.toFixed(2)} SAR`;
    return `${converted.toFixed(2)} AED`;
  };

  const handleNext = useCallback(() => {
    if (bundles.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % bundles.length);
  }, [bundles.length]);

  const handlePrev = useCallback(() => {
    if (bundles.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + bundles.length) % bundles.length);
  }, [bundles.length]);

  // Touch gesture handling for smooth mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diffX = touchStartX.current - touchEndX.current;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped Left
        if (isArabic) handlePrev();
        else handleNext();
      } else {
        // Swiped Right
        if (isArabic) handleNext();
        else handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!bundles || bundles.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full select-none py-6 sm:py-10">
      {/* 3D Carousel Stage */}
      <div
        className="relative w-full h-[520px] sm:h-[580px] md:h-[620px] flex items-center justify-center overflow-hidden"
        style={{ perspective: '1200px' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {bundles.map((bundle, index) => {
          // Calculate offset relative to activeIndex in circular space
          let offset = index - activeIndex;
          const total = bundles.length;

          // Wrap around for nearest distance
          if (total > 2) {
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;
          }

          const isActive = offset === 0;
          const isPrev = offset === -1;
          const isNext = offset === 1;
          const isVisible = Math.abs(offset) <= 2;

          if (!isVisible && total > 4) {
            return null;
          }

          // 3D positioning calculations
          let transformStyle = '';
          let zIndex = 10;
          let opacity = 0;
          let pointerEvents: 'auto' | 'none' = 'none';

          if (isActive) {
            transformStyle = 'translateX(0%) translateZ(60px) rotateY(0deg) scale(1)';
            zIndex = 30;
            opacity = 1;
            pointerEvents = 'auto';
          } else if (isPrev) {
            transformStyle = isArabic
              ? 'translateX(58%) translateZ(-90px) rotateY(-22deg) scale(0.88)'
              : 'translateX(-58%) translateZ(-90px) rotateY(22deg) scale(0.88)';
            zIndex = 20;
            opacity = 0.72;
            pointerEvents = 'auto';
          } else if (isNext) {
            transformStyle = isArabic
              ? 'translateX(-58%) translateZ(-90px) rotateY(22deg) scale(0.88)'
              : 'translateX(58%) translateZ(-90px) rotateY(-22deg) scale(0.88)';
            zIndex = 20;
            opacity = 0.72;
            pointerEvents = 'auto';
          } else if (offset < 0) {
            transformStyle = isArabic
              ? 'translateX(105%) translateZ(-200px) rotateY(-35deg) scale(0.72)'
              : 'translateX(-105%) translateZ(-200px) rotateY(35deg) scale(0.72)';
            zIndex = 10;
            opacity = 0.25;
            pointerEvents = 'none';
          } else {
            transformStyle = isArabic
              ? 'translateX(-105%) translateZ(-200px) rotateY(35deg) scale(0.72)'
              : 'translateX(105%) translateZ(-200px) rotateY(-35deg) scale(0.72)';
            zIndex = 10;
            opacity = 0.25;
            pointerEvents = 'none';
          }

          const savings = bundle.originalPrice - bundle.bundlePrice;
          const bundleItems = (bundle.productIds || [])
            .map((id) => productsMap[id] || products.find((p) => p.id === id))
            .filter(Boolean) as Product[];

          // Strictly use admin entered text
          const title = isArabic ? bundle.nameAr || bundle.name : bundle.name || bundle.nameAr;
          const tagline = isArabic ? bundle.taglineAr || bundle.tagline : bundle.tagline || bundle.taglineAr;
          const description = isArabic ? bundle.descriptionAr || bundle.description : bundle.description || bundle.descriptionAr;

          return (
            <div
              key={bundle.id}
              onClick={() => {
                if (!isActive) {
                  setActiveIndex(index);
                }
              }}
              style={{
                transform: transformStyle,
                zIndex,
                opacity,
                pointerEvents,
                transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
              className={`absolute w-[86%] sm:w-[420px] md:w-[460px] bg-white rounded-2xl border ${
                isActive
                  ? 'border-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.22)]'
                  : 'border-neutral-200 shadow-md cursor-pointer hover:border-neutral-400'
              } overflow-hidden flex flex-col`}
            >
              {/* Image Showcase */}
              <div
                className="relative aspect-[4/5] bg-neutral-100 overflow-hidden cursor-pointer"
                onClick={() => {
                  if (isActive) onOpenBundleModal(bundle);
                }}
              >
                <img
                  src={bundle.image}
                  alt={title || 'Outfit'}
                  className="w-full h-full object-cover object-top transition duration-700 hover:scale-105"
                  loading="lazy"
                />

                {/* Subtle Lighting Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-2">
                  {bundle.discountPercent > 0 && (
                    <span className="px-3 py-1 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-md shadow-md">
                      {isArabic ? `وفر ${bundle.discountPercent}%` : `${bundle.discountPercent}% OFF`}
                    </span>
                  )}
                  {bundle.badge && (
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-xs text-neutral-950 text-[10px] font-black tracking-wider uppercase rounded-md shadow-sm">
                      {isArabic && bundle.badgeAr ? bundle.badgeAr : bundle.badge}
                    </span>
                  )}
                </div>

                {savings > 0 && (
                  <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
                    <span className="px-2.5 py-1 bg-green-600/95 backdrop-blur-xs text-white text-[11px] font-bold rounded-md shadow-md">
                      {isArabic ? `وفر ${formatPrice(savings)}` : `Save ${formatPrice(savings)}`}
                    </span>
                  </div>
                )}

                {/* In-Image Quick Preview Bar */}
                {isActive && (
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-xs font-black">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'معاينة تفاصيل الإطلالة' : 'Preview Look'}</span>
                    </span>
                    {bundle.productIds && bundle.productIds.length > 0 && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-md text-[11px]">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{bundle.productIds.length} {isArabic ? 'قطع' : 'pieces'}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Outfit Content Details */}
              <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 bg-white">
                <div>
                  {tagline ? (
                    <span className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      {tagline}
                    </span>
                  ) : null}

                  <h3
                    onClick={() => {
                      if (isActive) onOpenBundleModal(bundle);
                    }}
                    className="font-heading font-black text-lg sm:text-xl text-neutral-950 hover:underline cursor-pointer mb-1 leading-snug truncate"
                  >
                    {title}
                  </h3>

                  {description ? (
                    <p className="text-xs text-neutral-600 line-clamp-2 mb-3 leading-relaxed">
                      {description}
                    </p>
                  ) : null}

                  {/* Included items pills */}
                  {bundleItems.length > 0 && (
                    <div className="mb-3 pt-2 border-t border-neutral-100">
                      <div className="flex flex-wrap gap-1.5">
                        {bundleItems.map((item) => (
                          <span
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectProduct) onSelectProduct(item);
                            }}
                            className="text-[10px] font-semibold px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded border border-neutral-200 cursor-pointer transition truncate max-w-[130px]"
                          >
                            {isArabic ? item.nameAr || item.name : item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing & CTA Button */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-neutral-400 font-bold uppercase">
                      {isArabic ? 'سعر الطقم كاملاً' : 'Full Set Price'}
                    </div>
                    <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
                      <span className="font-heading font-black text-lg sm:text-xl text-neutral-950">
                        {formatPrice(bundle.bundlePrice)}
                      </span>
                      {bundle.originalPrice > bundle.bundlePrice && (
                        <span className="text-xs text-neutral-400 line-through">
                          {formatPrice(bundle.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBundleModal(bundle);
                    }}
                    className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-md shrink-0"
                  >
                    <span>{isArabic ? 'تخصيص وطلب الطقم' : 'Shop Look'}</span>
                    <ArrowUpRight className="w-4 h-4 rtl:rotate-270" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls: Chevrons & Dots */}
      {bundles.length > 1 && (
        <div className="max-w-xs mx-auto mt-4 sm:mt-6 flex items-center justify-between px-4">
          <button
            type="button"
            onClick={isArabic ? handleNext : handlePrev}
            aria-label="Previous Outfit"
            className="w-10 h-10 rounded-full bg-white border border-neutral-300 hover:border-black hover:bg-black hover:text-white text-neutral-900 transition flex items-center justify-center shadow-md cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {bundles.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to look ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === activeIndex
                    ? 'w-7 h-2 bg-black'
                    : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-500'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={isArabic ? handlePrev : handleNext}
            aria-label="Next Outfit"
            className="w-10 h-10 rounded-full bg-white border border-neutral-300 hover:border-black hover:bg-black hover:text-white text-neutral-900 transition flex items-center justify-center shadow-md cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
};
