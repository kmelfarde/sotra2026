import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Layers, ShoppingBag, ExternalLink, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { ProductPromoBanner, CategoryTab } from '../types';
import { FEATURED_PROMO_BANNERS } from '../data/products';

interface PromoBannerShowcaseProps {
  banners?: ProductPromoBanner[];
  onOpenBundleModal?: (bundleId: string) => void;
  onSelectProductById?: (productId: string) => void;
  onOpenCategory?: (category: CategoryTab) => void;
  onShopTees?: () => void;
  onShopJackets?: () => void;
  isArabic: boolean;
}

export const PromoBannerShowcase: React.FC<PromoBannerShowcaseProps> = ({
  banners = FEATURED_PROMO_BANNERS,
  onOpenBundleModal = () => {},
  onSelectProductById = () => {},
  onOpenCategory = () => {},
  onShopTees,
  onShopJackets,
  isArabic
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance banner every 6 seconds if not hovered
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, banners.length]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const handleBannerAction = (banner: ProductPromoBanner) => {
    if (banner.targetType === 'bundle' && banner.targetId) {
      onOpenBundleModal(banner.targetId);
    } else if (banner.targetType === 'product' && banner.targetId) {
      onSelectProductById(banner.targetId);
    } else if (banner.targetType === 'category' && banner.targetId) {
      onOpenCategory(banner.targetId as CategoryTab);
    } else if (banner.targetType === 'link' && banner.targetUrl) {
      window.open(banner.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section className="py-6 sm:py-8 bg-neutral-100 border-y border-neutral-200" id="promo-showcase">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6 gap-2">
          <div>
            <div className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-red-600 font-extrabold text-[11px] uppercase tracking-widest mb-1">
              <Flame className="w-3.5 h-3.5 fill-red-600" />
              <span>{isArabic ? 'العروض الترويجية والأطقم الخاصة' : 'SPECIAL PROMOTIONS & OUTFIT DEALS'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 font-heading">
              {isArabic ? 'تنسيقات سوترة الحصرية' : 'EXCLUSIVE SOTRA SETS & OFFERS'}
            </h2>
          </div>

          {/* Navigation Dots / Controls */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse self-end sm:self-auto">
            <span className="text-xs font-bold text-neutral-500 font-mono">
              0{currentIndex + 1} / 0{banners.length}
            </span>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous promo banner"
                className="w-8 h-8 rounded-full border border-neutral-300 bg-white hover:bg-black hover:text-white hover:border-black flex items-center justify-center transition"
              >
                {isArabic ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next promo banner"
                className="w-8 h-8 rounded-full border border-neutral-300 bg-white hover:bg-black hover:text-white hover:border-black flex items-center justify-center transition"
              >
                {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Active Hero Banner Card */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative overflow-hidden rounded-lg bg-neutral-950 text-white shadow-2xl transition-all duration-500 border border-neutral-800"
        >
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={currentBanner.image}
              alt={isArabic ? currentBanner.titleAr : currentBanner.title}
              className="w-full h-full object-cover object-top opacity-35 filter brightness-90 transition-transform duration-1000 scale-100 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/40 rtl:bg-gradient-to-l" />
          </div>

          <div className="relative z-10 p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Content Side */}
            <div className="max-w-2xl space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-white text-black rounded font-heading">
                  {currentBanner.targetType === 'bundle' ? (
                    <>
                      <Layers className="w-3 h-3 mr-1 rtl:ml-1" />
                      <span>{isArabic ? (currentBanner.badgeAr || 'طقم متناسق') : (currentBanner.badge || 'OUTFIT BUNDLE')}</span>
                    </>
                  ) : currentBanner.targetType === 'product' ? (
                    <>
                      <ShoppingBag className="w-3 h-3 mr-1 rtl:ml-1" />
                      <span>{isArabic ? (currentBanner.badgeAr || 'قطعة مكملة') : (currentBanner.badge || 'MATCHING PAIR')}</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-3 h-3 mr-1 rtl:ml-1 text-red-500" />
                      <span>{isArabic ? (currentBanner.badgeAr || 'تشكيلة مميزة') : (currentBanner.badge || 'FEATURED')}</span>
                    </>
                  )}
                </span>

                {currentBanner.discountBadgeAr && (
                  <span className="text-[11px] font-black tracking-wider text-red-400 bg-red-950/90 border border-red-800/80 px-2 py-0.5 rounded">
                    {isArabic ? currentBanner.discountBadgeAr : currentBanner.discountBadge}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white font-heading">
                {isArabic ? currentBanner.titleAr : currentBanner.title}
              </h3>

              {/* Subtitle / Description */}
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans max-w-xl">
                {isArabic ? currentBanner.subtitleAr : currentBanner.subtitle}
              </p>

              {/* Quick perks */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-400 pt-1">
                <span>✓ {isArabic ? 'إمكانية اختيار المقاس لكل قطعة' : 'Custom sizing per piece'}</span>
                <span>✓ {isArabic ? 'شحن فوري ومعاينة قبل الاستلام' : 'Immediate express shipping'}</span>
              </div>
            </div>

            {/* Action Side */}
            <div className="w-full md:w-auto flex-shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
              <button
                type="button"
                onClick={() => handleBannerAction(currentBanner)}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 rtl:space-x-reverse transition duration-150 rounded shadow-lg cursor-pointer font-heading"
              >
                <span>
                  {isArabic
                    ? currentBanner.buttonTextAr || (currentBanner.targetType === 'bundle' ? 'تخصيص مقاسات الطقم وإضافته للحقيبة' : 'عرض التفاصيل والطلب')
                    : currentBanner.buttonText || (currentBanner.targetType === 'bundle' ? 'Customize Sizes & Add Bundle' : 'Shop Deal Now')}
                </span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              {/* Slide Quick Selectors */}
              <div className="flex items-center justify-center md:justify-start space-x-1.5 rtl:space-x-reverse pt-2">
                {banners.map((b: ProductPromoBanner, idx: number) => (
                  <button
                    key={b.id}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-neutral-700 hover:bg-neutral-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 4-Card Quick Carousel / Thumbnails */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-3">
          {banners.map((banner: ProductPromoBanner, idx: number) => {
            const isSelected = idx === currentIndex;
            return (
              <div
                key={banner.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  handleBannerAction(banner);
                }}
                className={`group cursor-pointer rounded p-2.5 sm:p-3 border transition-all duration-200 flex items-center space-x-2.5 rtl:space-x-reverse ${
                  isSelected
                    ? 'bg-white border-black shadow-md ring-1 ring-black'
                    : 'bg-white/80 hover:bg-white border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-neutral-200 relative">
                  <img
                    src={banner.image}
                    alt={isArabic ? banner.titleAr : banner.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  {banner.discountBadgeAr && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black px-1 rounded-bl">
                      {isArabic ? banner.discountBadgeAr : banner.discountBadge}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-extrabold uppercase text-neutral-500 block truncate">
                    {banner.targetType === 'bundle'
                      ? (isArabic ? 'طقم متكامل' : 'OUTFIT')
                      : banner.targetType === 'product'
                      ? (isArabic ? 'قطعة مكملة' : 'MATCH')
                      : (isArabic ? 'تشكيلة' : 'COLLECTION')}
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 break-words leading-tight group-hover:text-black">
                    {isArabic ? banner.titleAr : banner.title}
                  </h4>
                  <span className="text-[10px] text-neutral-500 font-medium group-hover:text-neutral-800 flex items-center mt-0.5">
                    {isArabic ? 'اضغط للتخصيص' : 'Click to customize'}
                    <ArrowIcon className="w-2.5 h-2.5 ml-1 rtl:mr-1 opacity-0 group-hover:opacity-100 transition" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
