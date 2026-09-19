import React from 'react';
import { Home, Grid, ShoppingBag, User, Headset } from 'lucide-react';
import { buildWhatsAppSupportUrl } from '../utils/whatsapp';

interface MobileBottomNavProps {
  cartCount: number;
  onGoHome: () => void;
  onOpenCatalog: () => void;
  onOpenCart: () => void;
  onOpenProfile: () => void;
  isArabic: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  onGoHome,
  onOpenCatalog,
  onOpenCart,
  onOpenProfile,
  isArabic
}) => {
  const whatsappUrl = buildWhatsAppSupportUrl({
    isArabic,
    type: isArabic ? 'استفسار' : 'Inquiry'
  });

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 rounded-t-xl px-2 py-2 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)] safe-area-pb">
      {/* Home */}
      <button
        onClick={onGoHome}
        className="flex flex-col items-center justify-center p-1.5 text-neutral-800 hover:text-black transition cursor-pointer min-w-[54px]"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-0.5">{isArabic ? 'الرئيسية' : 'Home'}</span>
      </button>

      {/* Catalog */}
      <button
        onClick={onOpenCatalog}
        className="flex flex-col items-center justify-center p-1.5 text-neutral-800 hover:text-black transition cursor-pointer min-w-[54px]"
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-0.5">{isArabic ? 'الأقسام' : 'Catalog'}</span>
      </button>

      {/* Cart with Badge */}
      <button
        onClick={onOpenCart}
        className="relative flex flex-col items-center justify-center p-1.5 text-neutral-950 hover:text-black transition cursor-pointer min-w-[54px]"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-[17px] h-[17px] px-1 bg-black text-white text-[9px] font-black rounded-full ring-1 ring-white">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-black mt-0.5">{isArabic ? 'السلة' : 'Bag'}</span>
      </button>

      {/* Profile & Orders */}
      <button
        onClick={onOpenProfile}
        className="flex flex-col items-center justify-center p-1.5 text-neutral-800 hover:text-black transition cursor-pointer min-w-[54px]"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-0.5">{isArabic ? 'طلباتي' : 'Profile'}</span>
      </button>

      {/* Customer Service */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center justify-center p-1.5 text-green-600 hover:text-green-700 transition cursor-pointer min-w-[54px]"
      >
        <Headset className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-0.5">{isArabic ? 'خدمة العملاء' : 'Support'}</span>
      </a>
    </div>
  );
};
