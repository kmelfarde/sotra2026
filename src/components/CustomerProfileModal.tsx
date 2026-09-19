import React, { useState } from 'react';
import { X, User, Phone, MapPin, Package, Clock, CheckCircle2, Truck, AlertCircle, Save, Headset, Search } from 'lucide-react';
import { CustomerProfile, CustomerOrder, CurrencyCode } from '../types';
import { EGYPT_GOVERNORATES_SHIPPING } from '../data/products';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CustomerProfile;
  orders: CustomerOrder[];
  onSaveProfile: (profile: CustomerProfile) => void;
  currency?: CurrencyCode;
  currencyRate?: number;
  isArabic: boolean;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  orders,
  onSaveProfile,
  currency = 'EGP',
  currencyRate = 1,
  isArabic
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  // Form State
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || '');
  const [governorate, setGovernorate] = useState(profile.governorate || EGYPT_GOVERNORATES_SHIPPING[0].nameAr);
  const [address, setAddress] = useState(profile.address || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search in Orders
  const [orderSearch, setOrderSearch] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name,
      phone,
      whatsapp: whatsapp || phone,
      governorate,
      address
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const filteredOrders = orders.filter((o) => {
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase().trim();
    return (
      o.orderId.toLowerCase().includes(q) ||
      (o.customer.phone && o.customer.phone.includes(q)) ||
      (o.customer.name && o.customer.name.toLowerCase().includes(q))
    );
  });

  const formatPrice = (amount: number) => {
    const converted = amount * currencyRate;
    if (currency === 'EGP') return `${amount} ج.م`;
    if (currency === 'USD') return `$${converted.toFixed(2)}`;
    if (currency === 'SAR') return `${converted.toFixed(2)} ر.س`;
    return `${converted.toFixed(2)} د.إ`;
  };

  const getStatusBadge = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase rounded flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{isArabic ? 'تم التأكيد وجاري التجهيز' : 'Confirmed & Processing'}</span>
          </span>
        );
      case 'shipping':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded flex items-center space-x-1">
            <Truck className="w-3 h-3" />
            <span>{isArabic ? 'في طريق الشحن والتوصيل' : 'Out for Delivery'}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isArabic ? 'تم التسليم بنجاح' : 'Delivered'}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-bold uppercase rounded flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>{isArabic ? 'قيد مراجعة التحويل والدفع' : 'Payment Under Review'}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-black text-white">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-neutral-300" />
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 font-bold block">
                SOTRA CUSTOMER HUB
              </span>
              <h2 className="text-sm sm:text-base font-black tracking-wider uppercase font-heading">
                {isArabic ? 'حساب العميل وسجل الطلبات' : 'Customer Profile & Orders'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-300 hover:text-white rounded-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 text-center cursor-pointer transition border-b-2 flex items-center justify-center space-x-1.5 ${
              activeTab === 'profile'
                ? 'border-black bg-white text-black font-black'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{isArabic ? 'بياناتي وعنوان الشحن' : 'My Saved Profile'}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 px-4 text-center cursor-pointer transition border-b-2 flex items-center justify-center space-x-1.5 ${
              activeTab === 'orders'
                ? 'border-black bg-white text-black font-black'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{isArabic ? `سجل طلباتي (${orders.length})` : `My Orders (${orders.length})`}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'profile' ? (
            /* Customer Profile Form */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-neutral-50 p-3.5 border border-neutral-200 text-xs text-neutral-600 rounded-none">
                <p className="font-semibold text-neutral-900 mb-1">
                  {isArabic ? 'حفظ بياناتك للطلبات السريعة:' : 'Save your info for fast checkout:'}
                </p>
                <p>
                  {isArabic
                    ? 'يتم حفظ بياناتك تلقائياً لتعبئة طلباتك القادمة بضغطة زر واحدة وتتبع شحناتك بسهولة.'
                    : 'Your info will be remembered on this device to auto-fill future checkouts and track deliveries.'}
                </p>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>{isArabic ? 'تم حفظ بياناتك بنجاح!' : 'Your profile has been saved successfully!'}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    {isArabic ? 'اسم العميل بالكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? 'مثال: محمد أحمد' : 'e.g. Mohamed Ahmed'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    {isArabic ? 'رقم الهاتف الأساسي *' : 'Primary Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={isArabic ? '010XXXXXXXX' : '010XXXXXXXX'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    {isArabic ? 'رقم الواتساب للتأكيد والتتبع *' : 'WhatsApp Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={isArabic ? '01XXXXXXXXX' : '01XXXXXXXXX'}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    {isArabic ? 'المحافظة *' : 'Governorate *'}
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 focus:outline-none focus:border-black font-medium cursor-pointer"
                  >
                    {EGYPT_GOVERNORATES_SHIPPING.map((gov) => (
                      <option key={gov.id} value={isArabic ? gov.nameAr : gov.nameEn}>
                        {isArabic ? `${gov.nameAr} (رسوم التوصيل: ${gov.fee} ج.م)` : `${gov.nameEn} (Delivery: LE ${gov.fee})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    {isArabic ? 'العنوان التفصيلي (المنطقة / الشارع / المبنى / الشقة) *' : 'Detailed Delivery Address *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? 'مثال: التجمع الخامس، الحي الأول، شارع 15، عمارة 4، الدور 2' : 'e.g. New Cairo, 1st District, Street 15, Bldg 4, Apt 2'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-widest transition flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{isArabic ? 'حفظ البيانات للاستخدام الدائم' : 'Save Profile Details'}</span>
              </button>
            </form>
          ) : (
            /* Orders History List */
            <div className="space-y-4">
              {/* Order Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  placeholder={isArabic ? 'ابحث برقم الطلب أو رقم الهاتف...' : 'Search by Order ID or Phone Number...'}
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 text-xs font-medium focus:outline-none focus:border-black"
                />
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 space-y-2">
                  <Package className="w-12 h-12 stroke-[1.2] mx-auto text-neutral-300" />
                  <p className="text-xs font-bold uppercase tracking-wider">
                    {isArabic ? 'لا توجد طلبات مسجلة بعد' : 'No orders recorded yet'}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {isArabic
                      ? 'عند إتمام أي طلب من المتجر سيتم حفظه هنا تلقائياً لمتابعته خطوة بخطوة.'
                      : 'When you place an order, it will appear here with live tracking updates.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.orderId}
                      className="border border-neutral-200 bg-white p-4 space-y-3 shadow-xs hover:border-neutral-400 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
                        <div>
                          <span className="text-xs font-black text-black block tracking-wider">
                            #{order.orderId}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {order.date}
                          </span>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3 text-xs">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-neutral-900 break-words leading-tight">
                                {isArabic && item.nameAr ? item.nameAr : item.name}
                              </p>
                              <p className="text-[10px] text-neutral-500">
                                {item.colorName} • {item.size} • {isArabic ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                              </p>
                            </div>
                            <span className="font-semibold text-neutral-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Payment & Transfer info */}
                      <div className="bg-neutral-50 p-2.5 text-[11px] space-y-1 text-neutral-700 border border-neutral-100">
                        <div className="flex justify-between">
                          <span>{isArabic ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                          <span className="font-bold text-neutral-900">
                            {order.paymentMethod === 'vodafone_cash'
                              ? (isArabic ? 'فودافون كاش' : 'Vodafone Cash')
                              : order.paymentMethod === 'instapay'
                              ? (isArabic ? 'انستا باي' : 'InstaPay')
                              : (isArabic ? 'الدفع عند الاستلام' : 'Cash on Delivery')}
                          </span>
                        </div>

                        {order.senderPhone && (
                          <div className="flex justify-between text-neutral-600">
                            <span>{isArabic ? 'رقم المحول منه:' : 'Sender Phone:'}</span>
                            <span className="font-semibold">{order.senderPhone}</span>
                          </div>
                        )}

                        {order.transactionRef && (
                          <div className="flex justify-between text-neutral-600">
                            <span>{isArabic ? 'رقم العملية / المرجع:' : 'Ref ID:'}</span>
                            <span className="font-semibold">{order.transactionRef}</span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span>{isArabic ? 'رسوم التوصيل:' : 'Delivery Fee:'}</span>
                          <span>{order.shippingFee === 0 ? (isArabic ? 'مجاناً' : 'FREE') : formatPrice(order.shippingFee)}</span>
                        </div>

                        <div className="flex justify-between font-black text-xs text-black pt-1 border-t border-neutral-200">
                          <span>{isArabic ? 'المجموع النهائي:' : 'Total Paid:'}</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-500 truncate max-w-[200px]">
                          📍 {order.customer.governorate} - {order.customer.address}
                        </span>
                        <a
                          href={`https://wa.me/201068989523?text=${encodeURIComponent(
                            isArabic
                              ? `مرحباً خدمة عملاء سوترة 👋\n• الاسم: ${order.customer.name}\n• رقم الطلب: #${order.orderId}\n• نوع الرسالة: استفسار عن حالة الطلب\n• التفاصيل: أود متابعة موعد تسليم طلبي لمحافظة ${order.customer.governorate}`
                              : `Hello SOTRA Support 👋\n• Name: ${order.customer.name}\n• Order ID: #${order.orderId}\n• Request Type: Order Tracking Inquiry\n• Details: Inquiry regarding delivery status to ${order.customer.governorate}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded cursor-pointer transition"
                        >
                          <Headset className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'متابعة الدعم' : 'Support'}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
