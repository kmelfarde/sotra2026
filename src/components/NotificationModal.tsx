import React from 'react';
import { X, Bell, Sparkles, Tag, ArrowRight, Check } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPromoCode: (code: string) => void;
  onShopNewArrivals: () => void;
  isArabic: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onApplyPromoCode,
  onShopNewArrivals,
  isArabic
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'promo-sotra10',
      type: 'discount',
      titleAr: 'كود خصم حصري للأعضاء 10%',
      titleEn: 'Exclusive 10% Member Voucher',
      descAr: 'استخدم كود SOTRA10 عند الدفع واحصل على خصم 10% فوري على سلة مشترياتك.',
      descEn: 'Use code SOTRA10 at checkout for an instant 10% off your entire cart.',
      code: 'SOTRA10',
      actionType: 'copy'
    },
    {
      id: 'drop-restock',
      type: 'drop',
      titleAr: 'إعادة توفر تشكيلة الكومبريشن والأوفر سايز',
      titleEn: 'Restocked: Heavyweight Oversized Drops',
      descAr: 'تمت إعادة توفير أفضل الموديلات مبيعاً بالألوان الأساسية (أسود، أبيض، رصاصي).',
      descEn: 'Our best-selling essentials have been restocked in all core colorways.',
      actionType: 'shop'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base">
              {isArabic ? 'تنبيهات العروض والإصدارات' : 'VIP Alerts & Drops'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-50 transition flex flex-col gap-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-red-600 shrink-0" />
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900">
                    {isArabic ? notif.titleAr : notif.titleEn}
                  </h4>
                </div>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {isArabic ? notif.descAr : notif.descEn}
              </p>

              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                {notif.code && (
                  <span className="px-2.5 py-1 bg-neutral-200 text-neutral-900 font-mono font-bold text-xs rounded tracking-wider">
                    {notif.code}
                  </span>
                )}

                {notif.actionType === 'copy' && notif.code ? (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyPromoCode(notif.code!);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded transition cursor-pointer"
                  >
                    {isArabic ? 'تطبيق الكود بالسلة' : 'Apply Promo'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onShopNewArrivals();
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded transition cursor-pointer"
                  >
                    {isArabic ? 'تسوق التشكيلة' : 'Shop Drop'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
