import React from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { SitePromoPopup } from '../types';

interface PromoPopupModalProps {
  popup: SitePromoPopup;
  isOpen: boolean;
  onClose: () => void;
  onSelectProductById: (productId: string) => void;
  onOpenCategory: (category: any) => void;
  isArabic: boolean;
}

export const PromoPopupModal: React.FC<PromoPopupModalProps> = ({
  popup,
  isOpen,
  onClose,
  onSelectProductById,
  onOpenCategory,
  isArabic
}) => {
  if (!isOpen || !popup || !popup.enabled) return null;

  const handleAction = () => {
    if (popup.targetType === 'product' && popup.targetId) {
      onSelectProductById(popup.targetId);
      onClose();
    } else if (popup.targetType === 'category' && popup.targetId) {
      onOpenCategory(popup.targetId);
      onClose();
    } else {
      onClose();
    }
  };

  const hasImage = Boolean(popup.imageUrl && popup.imageUrl.trim());
  const title = isArabic ? (popup.titleAr || popup.titleEn) : (popup.titleEn || popup.titleAr);
  const subtitle = isArabic ? (popup.subtitleAr || popup.subtitleEn) : (popup.subtitleEn || popup.subtitleAr);
  const buttonText = isArabic ? (popup.buttonTextAr || 'تسوق الآن') : (popup.buttonTextEn || 'Shop Now');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Floating */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Promo Image Container */}
        {hasImage && (
          <div
            className="w-full aspect-[4/3] bg-neutral-900 overflow-hidden cursor-pointer"
            onClick={handleAction}
          >
            <img
              src={popup.imageUrl}
              alt={title || 'Promotion'}
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {/* Text & Action CTA (only shown if title/subtitle or no image) */}
        {(title || !hasImage) && (
          <div className="p-6 text-center">
            {title && (
              <h3 className="text-lg sm:text-xl font-black text-neutral-950 uppercase tracking-tight font-heading mb-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-5 max-w-md mx-auto">
                {subtitle}
              </p>
            )}
            <button
              type="button"
              onClick={handleAction}
              className="w-full sm:w-auto px-8 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-widest rounded-lg transition shadow-md cursor-pointer"
            >
              {buttonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
