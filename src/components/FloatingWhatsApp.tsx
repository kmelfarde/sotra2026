import React, { useState } from 'react';
import { Headset, X, Send, HelpCircle, AlertCircle } from 'lucide-react';
import { buildWhatsAppSupportUrl } from '../utils/whatsapp';

interface FloatingWhatsAppProps {
  isArabic: boolean;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ isArabic }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [type, setType] = useState<'مشكلة' | 'استفسار' | 'inquiry' | 'problem'>(isArabic ? 'استفسار' : 'inquiry');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = buildWhatsAppSupportUrl({
      name,
      orderId,
      type: type === 'problem' || type === 'مشكلة' ? (isArabic ? 'مشكلة' : 'Problem') : (isArabic ? 'استفسار' : 'Inquiry'),
      details,
      isArabic
    });
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleDirectChat = () => {
    const defaultUrl = buildWhatsAppSupportUrl({
      isArabic,
      type: isArabic ? 'استفسار' : 'Inquiry'
    });
    window.open(defaultUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside
      aria-label="Customer Support Floating Action"
      className="fixed bottom-20 sm:bottom-6 right-3.5 sm:right-6 z-40 flex flex-col items-end"
    >
      {/* Floating Interactive Form Modal */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-40px)] sm:w-88 bg-white border border-neutral-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 text-neutral-900">
          {/* Header */}
          <div className="bg-neutral-950 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                <Headset className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider uppercase">
                  {isArabic ? 'خدمة عملاء سوترة' : 'SOTRA Customer Care'}
                </h4>
                <span className="text-[10px] text-green-400 font-medium block">
                  {isArabic ? 'فريق الدعم الفني متصل' : 'Support Online'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-neutral-400 hover:text-white transition cursor-pointer"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5 text-xs">
            {/* Name Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                {isArabic ? 'الاسم بالكامل *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black focus:bg-white transition font-medium"
              />
            </div>

            {/* Order Number Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                {isArabic ? 'رقم الطلب (إن وجد)' : 'Order Number (Optional)'}
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black focus:bg-white transition font-medium"
              />
            </div>

            {/* Request Type: Problem or Inquiry */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                {isArabic ? 'نوع الرسالة *' : 'Request Type *'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType(isArabic ? 'مشكلة' : 'problem')}
                  className={`py-1.5 px-2 rounded border text-[11px] font-bold flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition cursor-pointer ${
                    type === 'مشكلة' || type === 'problem'
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{isArabic ? 'مشكلة في طلب/منتج' : 'Problem / Issue'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType(isArabic ? 'استفسار' : 'inquiry')}
                  className={`py-1.5 px-2 rounded border text-[11px] font-bold flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition cursor-pointer ${
                    type === 'استفسار' || type === 'inquiry'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{isArabic ? 'استفسار عام' : 'General Inquiry'}</span>
                </button>
              </div>
            </div>

            {/* Message Details */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                {isArabic ? 'تفاصيل المشكلة أو الاستفسار' : 'Message Details'}
              </label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black focus:bg-white transition resize-none font-medium"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-1 space-y-1.5">
              <button
                type="submit"
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition shadow-md cursor-pointer text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isArabic ? 'إرسال إلى واتساب' : 'Send to WhatsApp'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDirectChat}
                className="w-full py-1.5 text-neutral-500 hover:text-neutral-900 text-[11px] font-semibold text-center transition cursor-pointer"
              >
                {isArabic ? 'أو المراسلة المباشرة الفورية بدون نموذج ←' : 'Or open direct chat without form →'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating WhatsApp Trigger Button with Headset Icon */}
      <div className="flex items-center space-x-2 rtl:space-x-reverse group">
        {!isOpen && (
          <div className="hidden sm:block bg-neutral-950 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {isArabic ? 'خدمة العملاء والدعم الفني' : 'Customer Support'}
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Customer support via WhatsApp"
          className="w-13 h-13 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl transition transform hover:scale-110 active:scale-95 cursor-pointer relative"
        >
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-white rounded-full border-2 border-green-500 flex items-center justify-center">
            <span className="w-2 h-2 bg-green-600 rounded-full animate-ping" />
          </span>
          <Headset className="w-6 h-6 stroke-[2.2]" />
        </button>
      </div>
    </aside>
  );
};
