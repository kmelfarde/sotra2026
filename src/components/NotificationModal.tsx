import React, { useState } from 'react';
import { X, Bell, Sparkles, Tag, ArrowRight, Check, Plus, Trash2, Send } from 'lucide-react';
import { StoreNotification } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPromoCode: (code: string) => void;
  onShopNewArrivals: () => void;
  isArabic: boolean;
  notifications?: StoreNotification[];
  onRemoveNotification?: (id: string) => void;
  onAddNotification?: (notif: StoreNotification) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onApplyPromoCode,
  onShopNewArrivals,
  isArabic,
  notifications: dynamicNotifications = [],
  onRemoveNotification,
  onAddNotification
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCode, setNewCode] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultNotifications: StoreNotification[] = [
    {
      id: 'promo-sotra10',
      type: 'discount',
      titleAr: 'كود خصم حصري للأعضاء 10%',
      titleEn: 'Exclusive 10% Member Voucher',
      descAr: 'استخدم كود SOTRA10 عند الدفع واحصل على خصم 10% فوري على سلة مشترياتك.',
      descEn: 'Use code SOTRA10 at checkout for an instant 10% off your entire cart.',
      code: 'SOTRA10',
      actionType: 'copy'
    }
  ];

  const notifications = dynamicNotifications.length > 0
    ? dynamicNotifications
    : defaultNotifications;

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const notif: StoreNotification = {
      id: `notif-${Date.now()}`,
      type: newCode.trim() ? 'discount' : 'announcement',
      titleAr: newTitle.trim(),
      titleEn: newTitle.trim(),
      descAr: newDesc.trim(),
      descEn: newDesc.trim(),
      code: newCode.trim() ? newCode.trim().toUpperCase() : undefined,
      actionType: newCode.trim() ? 'copy' : 'shop',
      createdAt: new Date().toISOString()
    };

    if (onAddNotification) {
      onAddNotification(notif);
    }
    setNewTitle('');
    setNewDesc('');
    setNewCode('');
    setIsCreating(false);
  };

  const handleCopy = (notif: StoreNotification) => {
    if (notif.code) {
      navigator.clipboard?.writeText(notif.code);
      setCopiedCodeId(notif.id);
      setTimeout(() => setCopiedCodeId(null), 2000);
      onApplyPromoCode(notif.code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base">
              {isArabic ? 'مركز الإشعارات والتنبيهات' : 'Notifications & VIP Alerts'}
            </h3>
            <span className="text-[11px] bg-neutral-800 text-neutral-300 font-mono px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCreating(!isCreating)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded flex items-center gap-1 transition cursor-pointer"
              title={isArabic ? 'إرسال إشعار جديد' : 'Send Notification'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إرسال إشعار' : 'Send'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Send Notification Form Drawer */}
        {isCreating && (
          <form onSubmit={handleCreateNotification} className="p-3.5 bg-neutral-100 border-b border-neutral-300 space-y-2.5 text-xs animate-in slide-in-from-top duration-200 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase text-neutral-900 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-amber-600" />
                {isArabic ? 'إنشاء وإرسال إشعار جديد للمتجر:' : 'Create & Broadcast Notification:'}
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              placeholder={isArabic ? 'عنوان الإشعار (مثال: خصم 20% لفترة محدودة)' : 'Notification Title'}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded font-bold text-xs"
              required
            />
            <textarea
              placeholder={isArabic ? 'نص وتفاصيل الإشعار...' : 'Notification Message...'}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded text-xs resize-none"
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isArabic ? 'كود الخصم (اختياري: SOTRA20)' : 'Promo Code (Optional)'}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded font-mono font-bold text-xs uppercase"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white font-black uppercase rounded cursor-pointer transition shadow-xs"
              >
                {isArabic ? 'إرسال الآن' : 'Broadcast'}
              </button>
            </div>
          </form>
        )}

        {/* Content list */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              <Bell className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p>{isArabic ? 'لا توجد إشعارات حالياً' : 'No notifications available'}</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/80 hover:bg-neutral-50 transition flex flex-col gap-2 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                    <h4 className="font-black text-xs sm:text-sm text-neutral-900">
                      {isArabic ? notif.titleAr : (notif.titleEn || notif.titleAr)}
                    </h4>
                  </div>
                  {onRemoveNotification && (
                    <button
                      type="button"
                      onClick={() => onRemoveNotification(notif.id)}
                      className="p-1 text-neutral-400 hover:text-red-600 rounded transition cursor-pointer"
                      title={isArabic ? 'إزالة هذا الإشعار' : 'Remove notification'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {isArabic ? notif.descAr : (notif.descEn || notif.descAr)}
                </p>

                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                  {notif.code ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-neutral-200 text-neutral-900 font-mono font-bold text-xs rounded tracking-wider">
                        {notif.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(notif)}
                        className="px-2.5 py-1 bg-black hover:bg-neutral-800 text-white text-[11px] font-bold rounded transition cursor-pointer flex items-center gap-1"
                      >
                        {copiedCodeId === notif.id ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span>{isArabic ? 'تم النسخ!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <span>{isArabic ? 'تطبيق الكود' : 'Apply Promo'}</span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onShopNewArrivals();
                        onClose();
                      }}
                      className="px-3 py-1 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded transition cursor-pointer"
                    >
                      {isArabic ? 'تسوق التشكيلة' : 'Shop Drop'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
