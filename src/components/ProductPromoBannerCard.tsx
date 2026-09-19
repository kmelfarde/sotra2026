import React from 'react';
import { ArrowRight, Sparkles, Layers, ArrowUpRight } from 'lucide-react';
import { ProductPromoBanner, CategoryTab } from '../types';

interface ProductPromoBannerCardProps {
  banner: ProductPromoBanner;
  onOpenBundleModal?: (bundleId: string) => void;
  onSelectProductById?: (productId: string) => void;
  onOpenCategory?: (category: CategoryTab) => void;
  isArabic: boolean;
  variant?: 'modal-featured' | 'inline' | 'compact';
}

export const ProductPromoBannerCard: React.FC<ProductPromoBannerCardProps> = ({
  banner,
  onOpenBundleModal,
  onSelectProductById,
  onOpenCategory,
  isArabic,
  variant = 'modal-featured'
}) => {
  const handleClick = () => {
    if (banner.targetType === 'bundle' && banner.targetId) {
      onOpenBundleModal?.(banner.targetId);
    } else if (banner.targetType === 'product' && banner.targetId) {
      onSelectProductById?.(banner.targetId);
    } else if (banner.targetType === 'category' && banner.targetId) {
      onOpenCategory?.(banner.targetId as CategoryTab);
    } else if (banner.targetType === 'link' && banner.targetUrl) {
      window.open(banner.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const title = isArabic ? banner.titleAr : banner.title;
  const subtitle = isArabic ? (banner.subtitleAr || banner.subtitle) : (banner.subtitle || banner.subtitleAr);
  const badge = isArabic ? (banner.badgeAr || banner.badge) : (banner.badge || banner.badgeAr);
  const discountBadge = isArabic ? (banner.discountBadgeAr || banner.discountBadge) : (banner.discountBadge || banner.discountBadgeAr);
  const buttonText = isArabic
    ? (banner.buttonTextAr || 'عرض التفاصيل')
    : (banner.buttonText || 'View Offer');

  return (
    <div
      onClick={handleClick}
      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 text-white p-4 sm:p-5 border border-neutral-800 shadow-lg cursor-pointer transition-all hover:border-neutral-700 hover:shadow-xl"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Banner Image */}
        {banner.image && (
          <div className="w-full sm:w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-neutral-800">
            <img
              src={banner.image}
              alt={title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Banner Details */}
        <div className="flex-1 min-w-0 text-center sm:text-start">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1.5">
            {badge && (
              <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 text-[10px] font-black uppercase tracking-wider rounded">
                {badge}
              </span>
            )}
            {discountBadge && (
              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded">
                {discountBadge}
              </span>
            )}
          </div>

          <h4 className="text-sm sm:text-base font-black text-white tracking-tight mb-1">
            {title}
          </h4>

          {subtitle && (
            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-3">
              {subtitle}
            </p>
          )}

          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-200 group-hover:text-white transition">
            <span>{buttonText}</span>
            <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
};
