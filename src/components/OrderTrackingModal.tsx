import React, { useState } from 'react';
import { X, Search, Truck, CheckCircle2, Clock, MapPin, Package, AlertCircle, Headset } from 'lucide-react';
import { CustomerOrder, CurrencyCode } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
  isArabic: boolean;
  currency: CurrencyCode;
  currencyRate: number;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  isArabic,
  currency,
  currencyRate
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setLoading(true);

    setTimeout(() => {
      const q = searchInput.toLowerCase().trim();
      const matched = orders.find(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          (o.customer.phone && o.customer.phone.includes(q)) ||
          (o.customer.whatsapp && o.customer.whatsapp.includes(q))
      );

      if (matched) {
        setFoundOrder(matched);
      } else {
        setFoundOrder(null);
      }
      setSearched(true);
      setLoading(false);
    }, 500);
  };

  const formatPrice = (amount: number) => {
    if (currency === 'EGP') return `${amount} ج.م`;
    return `$${(amount * currencyRate).toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-black text-white">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-neutral-300" />
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 font-bold block">
                SOTRA TRACKING
              </span>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider font-heading">
                {isArabic ? 'تتبع شحنة طلبك برقم الهاتف أو الطلب' : 'Track Order by Phone or Order #'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-300 hover:text-white rounded cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                {isArabic ? 'رقم الهاتف أو رقم الطلب (Order # / Phone) *' : 'Phone Number or Order Number *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={isArabic ? 'مثال: 01012345678 أو SOTRA-84920' : 'e.g. 01012345678 or SOTRA-84920'}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs font-semibold focus:outline-none focus:border-black uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-widest transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? (isArabic ? 'جاري البحث في قاعدة الشحن...' : 'Searching Tracking DB...') : (isArabic ? 'تتبع الشحنة الآن' : 'Track Package')}</span>
            </button>
          </form>

          {searched && foundOrder && (
            <div className="bg-neutral-50 p-4 border border-neutral-200 text-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <div>
                  <span className="font-bold text-neutral-900 block">#{foundOrder.orderId}</span>
                  <span className="text-[10px] text-neutral-500">{foundOrder.customer.name} ({foundOrder.customer.governorate})</span>
                </div>
                <span className="text-green-800 bg-green-100 font-bold px-2 py-0.5 rounded text-[10px]">
                  {isArabic ? foundOrder.statusAr || 'في طريق الشحن' : foundOrder.status}
                </span>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3.5 pl-3 border-l-2 border-black ml-1 text-xs">
                <div className="relative pl-3">
                  <div className="absolute -left-[19px] top-0.5 w-2.5 h-2.5 bg-black rounded-full" />
                  <p className="font-bold text-black">{isArabic ? 'تم استلام وتأكيد الطلب' : 'Order Received & Confirmed'}</p>
                  <p className="text-[10px] text-neutral-500">{isArabic ? 'مقر سوترة الرئيسي - القاهرة' : 'SOTRA Fulfillment Center'}</p>
                </div>
                <div className="relative pl-3">
                  <div className="absolute -left-[19px] top-0.5 w-2.5 h-2.5 bg-black rounded-full" />
                  <p className="font-bold text-black">{isArabic ? 'تم الفحص والتسليم لشركة الشحن' : 'Quality Checked & Dispatched'}</p>
                  <p className="text-[10px] text-neutral-500">{isArabic ? 'شحن إكسبريس (Bosta / R2S Express)' : 'Express Courier'}</p>
                </div>
                <div className="relative pl-3">
                  <div className="absolute -left-[19px] top-0.5 w-2.5 h-2.5 bg-green-600 rounded-full animate-ping" />
                  <p className="font-bold text-green-700">{isArabic ? 'مع المندوب في طريق التسليم اليوم' : 'Out for Delivery Today'}</p>
                  <p className="text-[10px] text-neutral-500">{isArabic ? 'سيتواصل معك المندوب هاتفياً لتسليم الشحنة' : 'Courier will call prior to delivery'}</p>
                </div>
              </div>

              {/* Order quick WhatsApp action */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/201068989523?text=${encodeURIComponent(
                    isArabic
                      ? `مرحباً خدمة عملاء سوترة 👋\n• الاسم: ${foundOrder.customer.name}\n• رقم الطلب: #${foundOrder.orderId}\n• نوع الرسالة: استفسار عن تتبع الشحنة\n• التفاصيل: أود معرفة موعد وصول شحنتي وتفاصيل المندوب لمحافظة ${foundOrder.customer.governorate}`
                      : `Hello SOTRA Support 👋\n• Name: ${foundOrder.customer.name}\n• Order ID: #${foundOrder.orderId}\n• Request Type: Shipment Tracking Inquiry\n• Details: Inquiry regarding delivery ETA to ${foundOrder.customer.governorate}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <Headset className="w-4 h-4" />
                  <span>{isArabic ? 'تواصل مع خدمة العملاء عبر واتساب' : 'WhatsApp Support'}</span>
                </a>
              </div>
            </div>
          )}
          {searched && !foundOrder && (
            <div className="bg-neutral-50 p-5 border border-neutral-200 text-center space-y-2 animate-in fade-in">
              <p className="font-bold text-neutral-900 text-xs">
                {isArabic ? 'لم يتم العثور على طلب مسجل بهذا الرقم أو الهاتف' : 'No order found with this order number or phone'}
              </p>
              <p className="text-[11px] text-neutral-500">
                {isArabic ? 'يرجى مراجعة رقم الطلب أو رقم الهاتف المسجل عند إتمام الشراء والمحاولة مجدداً.' : 'Please verify your phone or order reference and try again.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
