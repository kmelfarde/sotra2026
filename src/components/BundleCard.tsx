import React, { useState } from 'react';
import { Layers, ArrowRight, Check } from 'lucide-react';
import { OutfitBundle, CurrencyCode, Product } from '../types';

interface BundleCardProps {
  bundle: OutfitBundle;
  productsMap: Record<string, Product>;
  currency: CurrencyCode;
  currencyRate: number;
  onOpenBundleModal: (bundle: OutfitBundle) => void;
  isArabic: boolean;
}

export const BundleCard: React.FC<BundleCardProps> = ({
  bundle,
  productsMap,
  currency,
  currencyRate,
  onOpenBundleModal,
  isArabic
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (amount: number) => {
    const converted = amount * currencyRate;
    if (currency === 'EGP') return `LE ${amount.toFixed(2)}`;
    if (currency === 'USD') return `$${converted.toFixed(2)}`;
    if (currency === 'SAR') return `${converted.toFixed(2)} SAR`;
    return `${converted.toFixed(2)} AED`;
  };

  const includedProducts = bundle.productIds
    .map((id) => productsMap[id])
    .filter(Boolean);

  const images = bundle.galleryImages?.length > 0 ? bundle.galleryImages : [bundle.image];
  const displayImage = isHovered && images.length > 1 ? images[1] : images[activeImageIndex] || bundle.image;

  return (
    <div
      onClick={() => onOpenBundleModal(bundle)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white border border-neutral-200 rounded-lg sm:rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:border-neutral-900 cursor-pointer"
    >
      {/* Set Badge */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black tracking-wider px-2.5 py-1 uppercase shadow-md flex items-center">
          <span>{isArabic ? `خصم ${bundle.discountPercent}% على الطقم` : `SAVE ${bundle.discountPercent}% ON SET`}</span>
        </span>
        {bundle.badge && (
          <span className="bg-black text-white text-[9px] sm:text-[10px] font-extrabold tracking-widest px-2 py-0.5 uppercase shadow-xs">
            {isArabic && bundle.badgeAr ? bundle.badgeAr : bundle.badge}
          </span>
        )}
      </div>

      {/* Main Showcase Image */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
        <img
          src={displayImage}
          alt={isArabic ? bundle.nameAr : bundle.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Floating Included Products Mini Preview Pills */}
        <div className="absolute bottom-3 inset-x-3 z-10 bg-white/95 backdrop-blur-md p-2 rounded border border-white/40 shadow-lg">
          <div className="text-[10px] font-bold text-neutral-500 uppercase mb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Layers className="w-3 h-3 text-neutral-800" />
              <span>{isArabic ? `يحتوي هذا الطقم على ${includedProducts.length} قطع:` : `Set Includes ${includedProducts.length} Items:`}</span>
            </span>
            <span className="text-black font-extrabold">{isArabic ? 'تنسيق متكامل' : 'Matched Set'}</span>
          </div>

          <div className="flex items-center space-x-2">
            {includedProducts.map((prod, idx) => {
              const previewImg = prod.colors?.[0]?.images?.[0] || prod.colors?.[0]?.hex;
              return (
                <div
                  key={prod.id}
                  className="flex items-center space-x-1.5 bg-neutral-100 px-2 py-1 rounded border border-neutral-200 text-[10px] font-bold text-neutral-900 truncate max-w-[50%]"
                >
                  <span className="w-4 h-4 rounded-full overflow-hidden shrink-0 bg-neutral-200 border border-neutral-300">
                    <img src={previewImg} alt="" className="w-full h-full object-cover" />
                  </span>
                  <span className="truncate">{isArabic && prod.nameAr ? prod.nameAr : prod.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Set Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase text-red-600">
              {isArabic ? 'أطقم سوترة المتناسقة' : 'SOTRA COMPLETE OUTFIT'}
            </span>
            <span className="text-xs font-bold text-neutral-500 line-through">
              {formatPrice(bundle.originalPrice)}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-neutral-950 break-words mb-1 font-heading group-hover:text-neutral-700 transition">
            {isArabic ? bundle.nameAr : bundle.name}
          </h3>

          <p className="text-xs text-neutral-600 line-clamp-2 mb-3 leading-relaxed">
            {isArabic ? bundle.descriptionAr : bundle.description}
          </p>
        </div>

        {/* Pricing & CTA Button */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-bold text-neutral-400">
              {isArabic ? 'سعر الطقم بالكامل' : 'Complete Set Price'}
            </span>
            <span className="text-base sm:text-lg font-black text-neutral-950">
              {formatPrice(bundle.bundlePrice)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenBundleModal(bundle);
            }}
            className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-none flex items-center space-x-1.5 transition-all shadow-sm group-hover:bg-red-600"
          >
            <span>{isArabic ? 'تخصيص وطلب الطقم' : 'Customize Set'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
