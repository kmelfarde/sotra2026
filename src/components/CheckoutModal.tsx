import React, { useState, useEffect, useMemo } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, Smartphone, ArrowRight, Headset, Copy, Check, Info, CreditCard, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, CurrencyCode, CustomerProfile, CustomerOrder, WalletSettings, GovernorateRate } from '../types';
import { getWalletSettings, getGovernoratesRates } from '../utils/storeSettings';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  promoCode: string;
  currency: CurrencyCode;
  currencyRate: number;
  onClearCart: () => void;
  savedProfile: CustomerProfile;
  onSaveProfile: (profile: CustomerProfile) => void;
  onAddOrder: (order: CustomerOrder) => void;
  isArabic: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  discountAmount,
  promoCode,
  currency,
  currencyRate,
  onClearCart,
  savedProfile,
  onSaveProfile,
  onAddOrder,
  isArabic
}) => {
  const [walletSettings, setWalletSettings] = useState<WalletSettings>(() => getWalletSettings());
  const [governorates, setGovernorates] = useState<GovernorateRate[]>(() => getGovernoratesRates());

  // Listen for admin settings updates
  useEffect(() => {
    const handleUpdate = () => {
      setWalletSettings(getWalletSettings());
      setGovernorates(getGovernoratesRates());
    };
    window.addEventListener('sotra_settings_updated', handleUpdate);
    return () => window.removeEventListener('sotra_settings_updated', handleUpdate);
  }, []);

  // Form State initialized with saved customer profile
  const [fullName, setFullName] = useState(savedProfile.name || '');
  const [phone, setPhone] = useState(savedProfile.phone || '');
  const [whatsapp, setWhatsapp] = useState(savedProfile.whatsapp || '');
  const [governorateId, setGovernorateId] = useState(
    governorates.find((g) => g.nameAr === savedProfile.governorate || g.nameEn === savedProfile.governorate)?.id || 'cairo'
  );
  const [address, setAddress] = useState(savedProfile.address || '');
  const [notes, setNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'vodafone_cash' | 'instapay' | 'cod' | 'orange_cash' | 'etisalat_cash'>('vodafone_cash');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Available Payment Methods based on Admin Settings
  const availablePaymentMethods = useMemo(() => {
    const list: Array<{
      id: 'vodafone_cash' | 'instapay' | 'cod' | 'orange_cash' | 'etisalat_cash';
      nameAr: string;
      nameEn: string;
      descAr: string;
      descEn: string;
      color: string;
    }> = [];

    if (walletSettings.enableVodafoneCash !== false) {
      list.push({
        id: 'vodafone_cash',
        nameAr: 'فودافون كاش',
        nameEn: 'Vodafone Cash',
        descAr: 'تحويل لمحفظة فودافون كاش',
        descEn: 'Direct wallet transfer',
        color: 'red'
      });
    }

    if (walletSettings.enableInstapay !== false) {
      list.push({
        id: 'instapay',
        nameAr: 'انستا باي InstaPay',
        nameEn: 'InstaPay',
        descAr: 'تحويل لحظي بالمعرف أو الرقم',
        descEn: 'Instant bank transfer',
        color: 'purple'
      });
    }

    if (walletSettings.enableCod !== false) {
      list.push({
        id: 'cod',
        nameAr: 'الدفع عند الاستلام',
        nameEn: 'Cash on Delivery',
        descAr: 'الدفع لمندوب الشحن عند المعاينة',
        descEn: 'Pay to courier upon inspection',
        color: 'neutral'
      });
    }

    if (walletSettings.enableOrangeCash === true) {
      list.push({
        id: 'orange_cash',
        nameAr: 'أورنج كاش',
        nameEn: 'Orange Cash',
        descAr: 'تحويل لمحفظة أورنج كاش',
        descEn: 'Orange wallet transfer',
        color: 'orange'
      });
    }

    if (walletSettings.enableEtisalatCash === true) {
      list.push({
        id: 'etisalat_cash',
        nameAr: 'اتصالات كاش',
        nameEn: 'Etisalat Cash',
        descAr: 'تحويل لمحفظة اتصالات كاش',
        descEn: 'Etisalat wallet transfer',
        color: 'emerald'
      });
    }

    // Fallback if all are somehow disabled
    if (list.length === 0) {
      list.push({
        id: 'cod',
        nameAr: 'الدفع عند الاستلام',
        nameEn: 'Cash on Delivery',
        descAr: 'الدفع لمندوب الشحن عند المعاينة',
        descEn: 'Pay to courier upon inspection',
        color: 'neutral'
      });
    }

    return list;
  }, [walletSettings]);

  // Ensure current payment method is one of the enabled methods
  useEffect(() => {
    if (!availablePaymentMethods.some((m) => m.id === paymentMethod)) {
      if (availablePaymentMethods[0]) {
        setPaymentMethod(availablePaymentMethods[0].id);
      }
    }
  }, [availablePaymentMethods, paymentMethod]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CustomerOrder | null>(null);

  // Sync with savedProfile when modal opens
  useEffect(() => {
    if (savedProfile.name) setFullName(savedProfile.name);
    if (savedProfile.phone) setPhone(savedProfile.phone);
    if (savedProfile.whatsapp) setWhatsapp(savedProfile.whatsapp);
    if (savedProfile.address) setAddress(savedProfile.address);
    if (savedProfile.governorate) {
      const match = governorates.find(
        (g) => g.nameAr === savedProfile.governorate || g.nameEn === savedProfile.governorate
      );
      if (match) setGovernorateId(match.id);
    }
  }, [savedProfile, isOpen, governorates]);

  if (!isOpen) return null;

  const currentGov = governorates.find((g) => g.id === governorateId) || governorates[0];
  const shippingCost = currentGov ? currentGov.fee : 65;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const formatPrice = (amount: number) => {
    const converted = amount * currencyRate;
    if (currency === 'EGP') return `${amount} ج.م`;
    if (currency === 'USD') return `$${converted.toFixed(2)}`;
    if (currency === 'SAR') return `${converted.toFixed(2)} ر.س`;
    return `${converted.toFixed(2)} د.إ`;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(key);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      alert(isArabic ? 'يرجى استكمال جميع بيانات الشحن المطلوبة' : 'Please fill in all required delivery details');
      return;
    }

    // Strictly enforce shipping payment sender phone if required or using wallet
    if (walletSettings.requireShippingPayment || paymentMethod !== 'cod') {
      if (!senderPhone.trim()) {
        alert(
          isArabic
            ? `⚠️ إرسال رسوم الشحن (${shippingCost} ج.م) إجباري. يرجى إدخال رقم المحفظة / الحساب المحول منه لتأكيد الجدية وبدء تجهيز الشحنة.`
            : `Shipping fee payment (${shippingCost} LE) is mandatory. Please enter the sender phone/wallet number.`
        );
        return;
      }
    }

    setIsSubmitting(true);

    const newOrderId = `SOTRA-${Math.floor(100000 + Math.random() * 900000)}`;
    const govName = isArabic ? currentGov.nameAr : currentGov.nameEn;

    const customerProf: CustomerProfile = {
      name: fullName,
      phone: phone,
      whatsapp: whatsapp || phone,
      governorate: govName,
      address: address
    };

    const newOrder: CustomerOrder = {
      orderId: newOrderId,
      date: new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: [...items],
      customer: customerProf,
      paymentMethod,
      senderPhone: senderPhone.trim() || undefined,
      transactionRef: transactionRef.trim() || undefined,
      shippingFee: shippingCost,
      subtotal,
      discount: discountAmount,
      total: finalTotal,
      status: 'received',
      statusAr: 'تم استلام الطلب',
      stockDeducted: false
    };

    onSaveProfile(customerProf);
    onAddOrder(newOrder);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsSubmitting(false);
    setCompletedOrder(newOrder);
    onClearCart();
  };

  const handleCloseAll = () => {
    setCompletedOrder(null);
    onClose();
  };

  const vodafoneNumber = walletSettings.vodafoneCash || '01016839800';
  const instapayHandle = walletSettings.instapay || 'sotra@instapay';
  const instapayPhone = walletSettings.vodafoneCash || '01016839800';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-black text-white shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 font-bold">
              SOTRA FASHION CHECKOUT
            </span>
            <h2 className="text-sm sm:text-base font-black tracking-wider uppercase font-heading">
              {completedOrder
                ? (isArabic ? 'تم تأكيد طلبك بنجاح!' : 'Order Confirmed!')
                : (isArabic ? 'إتمام الدفع وتأكيد الطلب' : 'Secure Checkout & Payment')}
            </h2>
          </div>

          <button
            onClick={handleCloseAll}
            className="p-1.5 text-neutral-300 hover:text-white rounded-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Completed Receipt Screen */}
        {completedOrder ? (
          <div className="p-5 sm:p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block">
                Order #{completedOrder.orderId}
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-neutral-950 mt-1">
                {isArabic ? 'شكراً لطلبك من سوترة!' : 'Thank you for your order!'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-md mx-auto leading-relaxed">
                {isArabic
                  ? 'تم تسجيل طلبك وحفظ بياناتك بنجاح. جاري مراجعة وتجهيز الشحنة، وسيصلك إشعار عبر الواتساب واتصال من المندوب عند خروج الشحنة للتوصيل.'
                  : 'Your order has been recorded and your profile saved. Our team is preparing your package and our courier will deliver it within 24-48 hours.'}
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-neutral-50 p-4 border border-neutral-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between font-bold text-neutral-900 pb-2 border-b border-neutral-200">
                <span>{isArabic ? 'المبلغ الإجمالي المستحق:' : 'Total Amount:'}</span>
                <span className="text-sm font-black text-black">{formatPrice(completedOrder.total)}</span>
              </div>
              <p>
                <strong className="text-neutral-900">{isArabic ? 'اسم العميل:' : 'Customer:'}</strong> {completedOrder.customer.name}
              </p>
              <p>
                <strong className="text-neutral-900">{isArabic ? 'رقم الهاتف:' : 'Phone:'}</strong> {completedOrder.customer.phone}
              </p>
              <p>
                <strong className="text-neutral-900">{isArabic ? 'عنوان التوصيل:' : 'Delivery Address:'}</strong>{' '}
                {completedOrder.customer.governorate} - {completedOrder.customer.address}
              </p>
              <p>
                <strong className="text-neutral-900">{isArabic ? 'طريقة الدفع:' : 'Payment Method:'}</strong>{' '}
                {completedOrder.paymentMethod === 'vodafone_cash'
                  ? (isArabic ? 'فودافون كاش' : 'Vodafone Cash')
                  : completedOrder.paymentMethod === 'instapay'
                  ? (isArabic ? 'انستا باي' : 'InstaPay')
                  : (isArabic ? 'الدفع عند الاستلام' : 'Cash on Delivery')}
              </p>
              {completedOrder.senderPhone && (
                <p>
                  <strong className="text-neutral-900">{isArabic ? 'رقم المحول منه:' : 'Sender Phone:'}</strong> {completedOrder.senderPhone}
                </p>
              )}
              {completedOrder.transactionRef && (
                <p>
                  <strong className="text-neutral-900">{isArabic ? 'رقم العملية:' : 'Ref ID:'}</strong> {completedOrder.transactionRef}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <a
                href={`https://wa.me/201068989523?text=${encodeURIComponent(
                  isArabic
                    ? `مرحباً خدمة عملاء سوترة 👋\n• الاسم: ${completedOrder.customer.name}\n• رقم الطلب: #${completedOrder.orderId}\n• نوع الرسالة: تأكيد طلب جديد\n• التفاصيل: إجمالي الطلب ${completedOrder.total} ج.م لمحافظة ${completedOrder.customer.governorate}`
                    : `Hello SOTRA Support 👋\n• Name: ${completedOrder.customer.name}\n• Order ID: #${completedOrder.orderId}\n• Request Type: New Order Confirmation\n• Details: Total ${completedOrder.total} EGP for ${completedOrder.customer.governorate}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition"
              >
                <Headset className="w-4 h-4" />
                <span>{isArabic ? 'إرسال تأكيد بالواتساب' : 'Confirm on WhatsApp'}</span>
              </a>

              <button
                onClick={handleCloseAll}
                className="py-3 px-5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                {isArabic ? 'متابعة التسوق' : 'Continue Shopping'}
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handlePlaceOrder} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* Step 1: Customer Info & Area */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center space-x-1.5">
                  <span className="w-5 h-5 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>{isArabic ? 'بيانات العميل وعنوان الشحن' : 'Customer & Shipping Address'}</span>
                </h3>
                <span className="text-[10px] text-neutral-500 font-medium">
                  {isArabic ? '✓ يتم الحفظ تلقائياً' : '✓ Auto-saved to profile'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    {isArabic ? 'اسم العميل بالكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? 'مثال: أحمد محمود' : 'e.g. Ahmed Mahmoud'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    {isArabic ? 'رقم الهاتف الأساسي *' : 'Phone Number *'}
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
                    value={whatsapp || phone}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    {isArabic ? 'المحافظة (حساب رسوم الشحن) *' : 'Governorate (Shipping Calculation) *'}
                  </label>
                  <select
                    value={governorateId}
                    onChange={(e) => setGovernorateId(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 focus:outline-none focus:border-black font-medium cursor-pointer"
                  >
                    {governorates.map((gov) => (
                      <option key={gov.id} value={gov.id}>
                        {isArabic ? `${gov.nameAr} (شحن: ${gov.fee} ج.م)` : `${gov.nameEn} (Shipping: LE ${gov.fee})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    {isArabic ? 'العنوان التفصيلي ورقم المبنى والشقة *' : 'Detailed Address (Street, Building, Flat) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? 'اسم المنطقة، الشارع، رقم العمارة، رقم الشقة' : 'Area name, Street, Building #, Floor, Apartment #'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method Selection */}
            <div className="border-t border-neutral-200 pt-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 mb-3 flex items-center space-x-1.5">
                <span className="w-5 h-5 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  2
                </span>
                <span>{isArabic ? 'طريقة الدفع وتحويل الرسوم' : 'Payment Method & Transfer Info'}</span>
              </h3>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
                {availablePaymentMethods.map((method) => {
                  const isSelected = paymentMethod === method.id;
                  let borderClasses = 'border-neutral-200 hover:border-neutral-400 bg-neutral-50';
                  let textClass = 'text-neutral-900';
                  if (isSelected) {
                    if (method.id === 'vodafone_cash') {
                      borderClasses = 'border-red-600 bg-red-50/50 ring-1 ring-red-600';
                      textClass = 'text-red-700';
                    } else if (method.id === 'instapay') {
                      borderClasses = 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600';
                      textClass = 'text-purple-700';
                    } else if (method.id === 'orange_cash') {
                      borderClasses = 'border-orange-600 bg-orange-50/50 ring-1 ring-orange-600';
                      textClass = 'text-orange-700';
                    } else if (method.id === 'etisalat_cash') {
                      borderClasses = 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600';
                      textClass = 'text-emerald-700';
                    } else {
                      borderClasses = 'border-black bg-neutral-100 ring-1 ring-black';
                      textClass = 'text-neutral-900';
                    }
                  }

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 border text-left rtl:text-right cursor-pointer transition flex flex-col justify-between ${borderClasses}`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-xs font-bold ${textClass}`}>
                          {isArabic ? method.nameAr : method.nameEn}
                        </span>
                        {method.id === 'vodafone_cash' && <Smartphone className="w-4 h-4 text-red-600" />}
                        {method.id === 'instapay' && <CreditCard className="w-4 h-4 text-purple-600" />}
                        {method.id === 'cod' && <Truck className="w-4 h-4 text-neutral-900" />}
                        {method.id === 'orange_cash' && <Smartphone className="w-4 h-4 text-orange-600" />}
                        {method.id === 'etisalat_cash' && <Smartphone className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <span className="text-[10px] text-neutral-600 leading-tight">
                        {isArabic ? method.descAr : method.descEn}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Transfer Details Panel based on selection */}
              {paymentMethod === 'vodafone_cash' && (
                <div className="bg-red-50 border border-red-200 p-3.5 space-y-3 animate-in fade-in text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-red-900">
                        {isArabic ? 'بيانات التحويل عبر فودافون كاش:' : 'Vodafone Cash Transfer Details:'}
                      </h4>
                      <p className="text-[11px] text-red-700 mt-0.5">
                        {isArabic
                          ? `قم بتحويل المبلغ (${formatPrice(finalTotal)}) أو رسوم الشحن (${formatPrice(shippingCost)}) على رقم المحفظة:`
                          : `Transfer total (${formatPrice(finalTotal)}) or shipping fee (${formatPrice(shippingCost)}) to wallet:`}
                      </p>
                    </div>
                  </div>

                  {/* Transfer Number Box */}
                  <div className="bg-white p-2.5 border border-red-300 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm sm:text-base font-black text-black tracking-wider">
                        {vodafoneNumber}
                      </span>
                      <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                        {isArabic ? 'محفظة سوترة' : 'SOTRA Wallet'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(vodafoneNumber, 'voda')}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded flex items-center space-x-1 cursor-pointer transition"
                    >
                      {copiedAccount === 'voda' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAccount === 'voda' ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ الرقم' : 'Copy')}</span>
                    </button>
                  </div>

                  {/* Input Fields for verification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        {isArabic ? 'رقم الهاتف المحول منه (المرسل) *' : 'Sender Phone Number *'}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={isArabic ? '010XXXXXXXX' : '010XXXXXXXX'}
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full p-2 bg-white border border-red-300 focus:outline-none focus:border-red-600 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        {isArabic ? 'رقم العملية أو المرجع (اختياري)' : 'Transaction Ref Number (Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder={isArabic ? 'مثال: TXN-92810' : 'e.g. TXN-92810'}
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full p-2 bg-white border border-red-300 focus:outline-none focus:border-red-600 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'instapay' && (
                <div className="bg-purple-50 border border-purple-200 p-3.5 space-y-3 animate-in fade-in text-xs">
                  <div>
                    <h4 className="font-bold text-purple-900">
                      {isArabic ? 'بيانات التحويل عبر انستا باي (InstaPay):' : 'InstaPay Transfer Details:'}
                    </h4>
                    <p className="text-[11px] text-purple-700 mt-0.5">
                      {isArabic
                        ? `قم بالتحويل عبر تطبيق انستاباي بقيمة (${formatPrice(finalTotal)}) باستخدام العنوان أو الرقم:`
                        : `Transfer (${formatPrice(finalTotal)}) via InstaPay app using address or phone:`}
                    </p>
                  </div>

                  {/* Transfer Handles */}
                  <div className="space-y-2">
                    <div className="bg-white p-2.5 border border-purple-300 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-neutral-500 font-bold">{isArabic ? 'عنوان انستاباي:' : 'IPA:'}</span>
                        <span className="font-mono text-xs sm:text-sm font-black text-purple-950">{instapayHandle}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(instapayHandle, 'insta_handle')}
                        className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold rounded flex items-center space-x-1 cursor-pointer transition"
                      >
                        {copiedAccount === 'insta_handle' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAccount === 'insta_handle' ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ' : 'Copy')}</span>
                      </button>
                    </div>

                    <div className="bg-white p-2.5 border border-purple-300 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-neutral-500 font-bold">{isArabic ? 'رقم الهاتف المسجل:' : 'Phone:'}</span>
                        <span className="font-mono text-xs sm:text-sm font-black text-purple-950">{instapayPhone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(instapayPhone, 'insta_phone')}
                        className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold rounded flex items-center space-x-1 cursor-pointer transition"
                      >
                        {copiedAccount === 'insta_phone' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAccount === 'insta_phone' ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ' : 'Copy')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        {isArabic ? 'اسم الحساب / الرقم المحول منه *' : 'Sender InstaPay Username or Phone *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isArabic ? 'مثال: username@instapay أو رقم الهاتف' : 'e.g. username@instapay or phone'}
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full p-2 bg-white border border-purple-300 focus:outline-none focus:border-purple-600 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        {isArabic ? 'الرقم المرجعي للمعاملة البنكية (اختياري)' : 'Bank Transaction Reference (Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder={isArabic ? 'مثال: 9840217' : 'e.g. 9840217'}
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full p-2 bg-white border border-purple-300 focus:outline-none focus:border-purple-600 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'orange_cash' && (
                <div className="bg-orange-50 border border-orange-200 p-3.5 space-y-3 animate-in fade-in text-xs">
                  <div>
                    <h4 className="font-bold text-orange-900">
                      {isArabic ? 'بيانات التحويل عبر أورنج كاش:' : 'Orange Cash Transfer Details:'}
                    </h4>
                    <p className="text-[11px] text-orange-700 mt-0.5">
                      {isArabic
                        ? `قم بتحويل المبلغ (${formatPrice(finalTotal)}) أو رسوم الشحن (${formatPrice(shippingCost)}) على رقم المحفظة:`
                        : `Transfer total (${formatPrice(finalTotal)}) or shipping fee (${formatPrice(shippingCost)}) to Orange wallet:`}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 border border-orange-300 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm sm:text-base font-black text-black tracking-wider">
                        {walletSettings.orangeCash || vodafoneNumber}
                      </span>
                      <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded">
                        {isArabic ? 'محفظة أورنج' : 'Orange Wallet'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(walletSettings.orangeCash || vodafoneNumber, 'orange')}
                      className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold rounded flex items-center space-x-1 cursor-pointer transition"
                    >
                      {copiedAccount === 'orange' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAccount === 'orange' ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ الرقم' : 'Copy')}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        {isArabic ? 'رقم الهاتف المحول منه (المرسل) *' : 'Sender Phone Number *'}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="012XXXXXXXX"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full p-2 bg-white border border-orange-300 focus:outline-none focus:border-orange-600 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        {isArabic ? 'رقم العملية أو المرجع (اختياري)' : 'Transaction Ref Number (Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TXN-92810"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full p-2 bg-white border border-orange-300 focus:outline-none focus:border-orange-600 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'etisalat_cash' && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 space-y-3 animate-in fade-in text-xs">
                  <div>
                    <h4 className="font-bold text-emerald-900">
                      {isArabic ? 'بيانات التحويل عبر اتصالات كاش:' : 'Etisalat Cash Transfer Details:'}
                    </h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      {isArabic
                        ? `قم بتحويل المبلغ (${formatPrice(finalTotal)}) أو رسوم الشحن (${formatPrice(shippingCost)}) على رقم المحفظة:`
                        : `Transfer total (${formatPrice(finalTotal)}) or shipping fee (${formatPrice(shippingCost)}) to Etisalat wallet:`}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 border border-emerald-300 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm sm:text-base font-black text-black tracking-wider">
                        {walletSettings.etisalatCash || vodafoneNumber}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        {isArabic ? 'محفظة اتصالات' : 'Etisalat Wallet'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(walletSettings.etisalatCash || vodafoneNumber, 'etisalat')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded flex items-center space-x-1 cursor-pointer transition"
                    >
                      {copiedAccount === 'etisalat' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAccount === 'etisalat' ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ الرقم' : 'Copy')}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        {isArabic ? 'رقم الهاتف المحول منه (المرسل) *' : 'Sender Phone Number *'}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="011XXXXXXXX"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full p-2 bg-white border border-emerald-300 focus:outline-none focus:border-emerald-600 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        {isArabic ? 'رقم العملية أو المرجع (اختياري)' : 'Transaction Ref Number (Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TXN-92810"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full p-2 bg-white border border-emerald-300 focus:outline-none focus:border-emerald-600 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="bg-amber-50/70 border border-amber-300 p-3.5 text-xs space-y-2.5 animate-in fade-in">
                  <div className="flex items-start space-x-2 rtl:space-x-reverse text-amber-950">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-bold">
                        {isArabic ? 'الدفع عند الاستلام مع اشتراط سداد رسوم الشحن:' : 'Cash on Delivery (Advance Shipping Fee Required):'}
                      </p>
                      <p className="text-amber-900 text-[11px] mt-0.5 leading-relaxed">
                        {isArabic
                          ? `لضمان جدية حجز الشحنة، يلزم تحويل رسوم الشحن (${formatPrice(shippingCost)}) لمحافظة ${currentGov.nameAr} مسبقاً عبر فودافون كاش (${vodafoneNumber}) أو انستاباي (${instapayHandle}). ويكون باقي ثمن المنتجات (${formatPrice(Math.max(0, subtotal - discountAmount))}) نقداً للمندوب عند الاستلام والتجربة.`
                          : `To reserve your package, transferring the shipping fee (${formatPrice(shippingCost)}) in advance via Vodafone Cash or InstaPay is required. The balance is paid cash on delivery.`}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 mb-1">
                      {isArabic ? 'رقم المحفظة / الحساب المحول منه رسوم الشحن (إجباري) *' : 'Sender Phone / Wallet for Shipping Fee (Required) *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={isArabic ? '010XXXXXXXX' : '010XXXXXXXX'}
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full p-2 bg-white border border-amber-300 focus:outline-none focus:border-amber-600 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Order Price Breakdown Strip */}
            <div className="bg-neutral-50 p-3.5 border border-neutral-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span>{isArabic ? `المنتجات (${items.reduce((s, i) => s + i.quantity, 0)})` : `Items (${items.reduce((s, i) => s + i.quantity, 0)})`}</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>{isArabic ? `الخصم (${promoCode})` : `Discount (${promoCode})`}</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>
                  {isArabic ? `رسوم الشحن (${currentGov.nameAr})` : `Shipping (${currentGov.nameEn})`}
                </span>
                <span>
                  {shippingCost === 0 ? (
                    <strong className="text-green-700">{isArabic ? 'مجاناً (أكثر من 1000 ج.م)' : 'FREE (Over LE 1000)'}</strong>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm text-neutral-950 pt-2 border-t border-neutral-200">
                <span>{isArabic ? 'المبلغ الإجمالي المطلوب' : 'Total Amount'}</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Submit Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-black uppercase tracking-widest transition flex items-center justify-center space-x-2 shadow-xl cursor-pointer"
            >
              {isSubmitting ? (
                <span>{isArabic ? 'جاري تأكيد الطلب وحفظ البيانات...' : 'Processing Order...'}</span>
              ) : (
                <>
                  <span>
                    {isArabic ? 'تأكيد وحفظ الطلب الآن' : 'Confirm & Place Order'} • {formatPrice(finalTotal)}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
