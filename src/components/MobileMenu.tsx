import React from 'react';
import { X, ChevronRight, Globe, DollarSign, Truck, ShieldCheck, Instagram, Headset, Flame, Layers } from 'lucide-react';
import { CategoryTab, CurrencyCode } from '../types';
import { buildWhatsAppSupportUrl } from '../utils/whatsapp';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (cat: CategoryTab) => void;
  onOpenSizeGuide?: () => void;
  onOpenOrderTracking: () => void;
  onOpenProfile: () => void;
  currency: CurrencyCode;
  onChangeCurrency: (c: CurrencyCode) => void;
  isArabic: boolean;
  onToggleLanguage: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenOrderTracking,
  onOpenProfile,
  currency,
  onChangeCurrency,
  isArabic,
  onToggleLanguage
}) => {
  if (!isOpen) return null;

  const handleNav = (cat: CategoryTab) => {
    onSelectCategory(cat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-start animate-in fade-in duration-200">
      <div className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-black text-white">
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-[0.25em] font-stencil uppercase">
              SOTRA
            </span>
            <span className="text-[8px] uppercase tracking-[0.35em] text-neutral-400 -mt-0.5">
              fashion
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-300 hover:text-white cursor-pointer"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Main Collections */}
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">
              Collections
            </div>

            <button
              onClick={() => handleNav('all')}
              className="w-full flex items-center justify-between py-2.5 text-xs font-black uppercase tracking-wider text-neutral-950 hover:text-red-600 transition"
            >
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-red-600" />
                <span>{isArabic ? 'جميع المنتجات' : 'All Products / New Drops'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleNav('sets')}
              className="w-full flex items-center justify-between py-2.5 text-xs font-black uppercase tracking-wider text-red-600 bg-red-50/70 px-2.5 rounded-lg border border-red-100 hover:bg-red-100/70 transition"
            >
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-red-600" />
                <span>{isArabic ? 'قسم الأطقم والتنسيقات (وفر حتى 30%)' : 'Outfit Sets & Bundles (Save 30%)'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-600" />
            </button>

            <button
              onClick={() => handleNav('compressions')}
              className="w-full flex items-center justify-between py-2.5 text-xs font-black uppercase tracking-wider text-neutral-900 hover:text-black transition"
            >
              <span>{isArabic ? 'ملابس ضاغطة ستيلث' : 'Stealth Compressions'}</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleNav('tops')}
              className="w-full flex items-center justify-between py-2.5 text-xs font-black uppercase tracking-wider text-neutral-900 hover:text-black transition"
            >
              <span>{isArabic ? 'تيشيرتات وأوفرسايز' : 'Oversized & Raglan Tees'}</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleNav('tanks')}
              className="w-full flex items-center justify-between py-2.5 text-xs font-black uppercase tracking-wider text-neutral-900 hover:text-black transition"
            >
              <span>{isArabic ? 'ملابس كت وتانك' : 'Tanks & Sleeveless'}</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleNav('bottoms')}
              className="w-full flex items-center justify-between py-2.5 text-xs font-black uppercase tracking-wider text-neutral-900 hover:text-black transition"
            >
              <span>{isArabic ? 'سويت بانتس وشورتات' : 'Sweatpants & Shorts'}</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleNav('accessories')}
              className="w-full flex items-center justify-between py-2.5 text-xs font-black uppercase tracking-wider text-neutral-900 hover:text-black transition"
            >
              <span>{isArabic ? 'اكسسوارات وشنط' : 'Accessories & Duffles'}</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          </div>

          {/* Quick Utility Tools */}
          <div className="border-t border-neutral-200 pt-4 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">
              {isArabic ? 'الحساب والخدمات' : 'Account & Support'}
            </div>

            <button
              onClick={() => {
                onOpenProfile();
                onClose();
              }}
              className="w-full flex items-center space-x-2.5 py-2 text-xs font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2 rounded transition"
            >
              <span>👤</span>
              <span>{isArabic ? 'بيانات العميل وسجل طلباتي' : 'Customer Profile & Orders'}</span>
            </button>

            <button
              onClick={() => {
                onOpenOrderTracking();
                onClose();
              }}
              className="w-full flex items-center space-x-2.5 py-2 text-xs font-bold text-neutral-700 hover:text-black transition"
            >
              <Truck className="w-4 h-4 text-neutral-500" />
              <span>{isArabic ? 'تتبع الشحنة' : 'Track Your Order'}</span>
            </button>

            <a
              href={buildWhatsAppSupportUrl({ isArabic, type: isArabic ? 'استفسار' : 'Inquiry' })}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center space-x-2.5 rtl:space-x-reverse py-2 text-xs font-bold text-neutral-700 hover:text-green-600 transition"
            >
              <Headset className="w-4 h-4 text-green-600" />
              <span>{isArabic ? 'خدمة العملاء' : 'Customer Support'}</span>
            </a>
          </div>

          {/* Language & Currency Selectors */}
          <div className="border-t border-neutral-200 pt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-700 flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-neutral-500" />
                <span>Language:</span>
              </span>
              <button
                onClick={onToggleLanguage}
                className="font-black px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-xs cursor-pointer"
              >
                {isArabic ? 'English' : 'عربي (العربية)'}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-700 flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-neutral-500" />
                <span>Currency:</span>
              </span>
              <select
                value={currency}
                onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
                className="font-bold bg-neutral-100 p-1 rounded text-xs cursor-pointer focus:outline-none"
              >
                <option value="EGP">EGP (Egyptian Pound LE)</option>
                <option value="USD">USD ($)</option>
                <option value="SAR">SAR (Saudi Riyal)</option>
                <option value="AED">AED (UAE Dirham)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-center">
          <p className="text-[10px] text-neutral-500 font-medium">
            © {new Date().getFullYear()} SOTRA Fashion. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
