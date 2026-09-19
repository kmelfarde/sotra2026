import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, CheckCircle2 } from 'lucide-react';
import { CartItem, CurrencyCode } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onProceedToCheckout?: () => void;
  onCheckout?: () => void;
  subtotal?: number;
  currency: CurrencyCode;
  currencyRate: number;
  promoCode: string;
  discountAmount: number;
  onApplyPromo: (code: string) => { success: boolean; message: string };
  isArabic: boolean;
  onOpenSizeGuide?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onCheckout,
  subtotal: propSubtotal,
  currency,
  currencyRate,
  promoCode,
  discountAmount,
  onApplyPromo,
  isArabic,
  onOpenSizeGuide
}) => {
  const handleCheckout = onCheckout || onProceedToCheckout || (() => {});
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [orderNote, setOrderNote] = useState('');

  if (!isOpen) return null;

  const calculatedSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotal = propSubtotal !== undefined ? propSubtotal : calculatedSubtotal;
  const freeShippingThreshold = 1000; // in EGP
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingCost = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 50;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const formatPrice = (amount: number) => {
    const converted = amount * currencyRate;
    if (currency === 'EGP') return `LE ${amount.toFixed(2)}`;
    if (currency === 'USD') return `$${converted.toFixed(2)}`;
    if (currency === 'SAR') return `${converted.toFixed(2)} SAR`;
    return `${converted.toFixed(2)} AED`;
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = onApplyPromo(promoInput.trim());
    setPromoFeedback(res);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-black" />
            <h2 className="text-sm sm:text-base font-black tracking-wider uppercase font-heading text-neutral-950">
              {isArabic ? 'حقيبة التسوق' : 'Your Shopping Bag'}
            </h2>
            <span className="bg-black text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-600 hover:text-black rounded-md transition cursor-pointer"
            aria-label="Close Cart"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-neutral-100 p-3 sm:p-4 border-b border-neutral-200 text-xs">
          {remainingForFreeShipping > 0 ? (
            <div>
              <p className="font-semibold text-neutral-800 mb-1.5 flex items-center justify-between">
                <span>
                  {isArabic ? 'أضف بقيمة ' : 'Add '}
                  <strong className="text-black">{formatPrice(remainingForFreeShipping)}</strong>
                  {isArabic ? ' للحصول على شحن مجاني!' : ' more for FREE Delivery!'}
                </span>
                <Truck className="w-4 h-4 text-neutral-700" />
              </p>
              <div className="w-full bg-neutral-300 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-700 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {isArabic ? '🎉 مبروك! لقد حصلت على شحن مجاني لكافة محافظات مصر!' : "🎉 You've unlocked FREE Nationwide Delivery!"}
              </span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mb-3" />
              <h3 className="font-black text-sm uppercase tracking-wider text-neutral-900 mb-1">
                {isArabic ? 'حقيبة التسوق فارغة' : 'Your bag is empty'}
              </h3>
              <p className="text-xs text-neutral-500 mb-6 max-w-xs">
                {isArabic
                  ? 'استكشف تشكيلات سوترة الجديدة وسيطر على تمرينك القادم.'
                  : 'Check out the new stealth compression drops and grab your gear.'}
              </p>
              <button
                onClick={onClose}
                className="py-3 px-6 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition cursor-pointer"
              >
                {isArabic ? 'تسوق المنتجات الآن' : 'Shop New Drops'}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartId}
                className="flex space-x-3 sm:space-x-4 border-b border-neutral-100 pb-4 last:border-0"
              >
                {/* Item Thumbnail */}
                <div className="relative w-20 h-26 bg-neutral-100 overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Item Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-black uppercase tracking-tight text-neutral-950 break-words leading-tight">
                        {isArabic && item.nameAr ? item.nameAr : item.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.cartId)}
                        className="text-neutral-400 hover:text-red-600 p-1 transition"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 mt-1 text-[11px] text-neutral-700">
                      <span className="font-semibold">{isArabic ? `المقاس: ${item.size}` : `Size: ${item.size}`}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block border border-neutral-300"
                          style={{ backgroundColor: item.colorHex }}
                        />
                        <span className="truncate max-w-[100px]">{item.colorName}</span>
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-neutral-200 bg-neutral-50">
                      <button
                        onClick={() => onUpdateQuantity(item.cartId, -1)}
                        className="px-2.5 py-1 text-xs font-bold hover:bg-neutral-200"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 text-xs font-bold text-black min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartId, 1)}
                        className="px-2.5 py-1 text-xs font-bold hover:bg-neutral-200"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-black text-xs sm:text-sm text-neutral-950">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Totals, Promo Code, and Checkout Button */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex space-x-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder={isArabic ? "كوبون الخصم (مثال: SOTRA10)" : "Discount Code (e.g. SOTRA10)"}
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-neutral-300 focus:outline-none focus:border-black uppercase font-semibold"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                {isArabic ? 'تطبيق' : 'Apply'}
              </button>
            </form>

            {promoFeedback && (
              <p
                className={`text-[11px] font-semibold ${
                  promoFeedback.success ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {promoFeedback.message}
              </p>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-neutral-600 pt-1">
              <div className="flex justify-between">
                <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-bold text-neutral-900">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>{isArabic ? `الخصم (${promoCode})` : `Discount (${promoCode})`}</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{isArabic ? 'الشحن السريع' : 'Shipping (Egypt Express)'}</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-700 font-bold uppercase">{isArabic ? 'مجاناً' : 'FREE'}</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-black text-neutral-950 pt-2 border-t border-neutral-200">
                <span>{isArabic ? 'الإجمالي الكلي' : 'Total'}</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout Action CTA */}
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>{isArabic ? 'إتمام الشراء الآن' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
