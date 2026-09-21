import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Tag,
  Truck,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Eye,
  Sliders,
  Upload,
  Layers
} from 'lucide-react';
import {
  StoreNotification,
  SitePromoPopup,
  HeroBannerSettings,
  TopAnnouncementSettings,
  FreeShippingSettings,
  PromoCode
} from '../../types';
import { saveSettingDoc } from '../../firebase/db';
import { saveLocalSetting } from '../../utils/storeSettings';

interface AdminMarketingTabProps {
  notifications: StoreNotification[];
  onUpdateNotifications: (notifs: StoreNotification[]) => void;
  promoPopup: SitePromoPopup;
  onUpdatePromoPopup: (popup: SitePromoPopup) => void;
  heroBanner: HeroBannerSettings;
  onUpdateHeroBanner: (banner: HeroBannerSettings) => void;
  topAnnouncement: TopAnnouncementSettings;
  onUpdateTopAnnouncement: (announcement: TopAnnouncementSettings) => void;
  freeShipping: FreeShippingSettings;
  onUpdateFreeShipping: (shipping: FreeShippingSettings) => void;
  promoCodes: PromoCode[];
  onUpdatePromoCodes: (codes: PromoCode[]) => void;
  isArabic: boolean;
  onNotify: (msg: string) => void;
}

export const AdminMarketingTab: React.FC<AdminMarketingTabProps> = ({
  notifications,
  onUpdateNotifications,
  promoPopup,
  onUpdatePromoPopup,
  heroBanner,
  onUpdateHeroBanner,
  topAnnouncement,
  onUpdateTopAnnouncement,
  freeShipping,
  onUpdateFreeShipping,
  promoCodes,
  onUpdatePromoCodes,
  isArabic,
  onNotify
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'notifications' | 'promo_popup' | 'announcement_bar' | 'hero_banner' | 'discounts'
  >('notifications');

  // 1. Notification creation state
  const [newNotif, setNewNotif] = useState<Partial<StoreNotification>>({
    titleAr: '',
    titleEn: '',
    descAr: '',
    descEn: '',
    code: '',
    type: 'discount',
    actionType: 'copy'
  });

  // 2. Promo Code creation state
  const [newCode, setNewCode] = useState<Partial<PromoCode>>({
    code: '',
    discountPercent: 10,
    minOrder: 0,
    isActive: true
  });

  // 3. Announcement addition state
  const [newAnnouncementAr, setNewAnnouncementAr] = useState('');
  const [newAnnouncementEn, setNewAnnouncementEn] = useState('');

  // 4. Hero Banner slide addition state
  const [newBannerImage, setNewBannerImage] = useState('');

  // ---------------------------------------------------------------------------
  // NOTIFICATIONS HANDLERS
  // ---------------------------------------------------------------------------
  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotif.titleAr || !newNotif.descAr) {
      onNotify(isArabic ? 'يرجى إدخال عنوان ونص التنبيه بالعربي' : 'Please provide Arabic title and message');
      return;
    }
    const item: StoreNotification = {
      id: `notif-${Date.now().toString(36)}`,
      titleAr: newNotif.titleAr.trim(),
      titleEn: newNotif.titleEn?.trim() || newNotif.titleAr.trim(),
      descAr: newNotif.descAr.trim(),
      descEn: newNotif.descEn?.trim() || newNotif.descAr.trim(),
      code: newNotif.code?.trim().toUpperCase() || undefined,
      type: newNotif.type || 'discount',
      actionType: newNotif.actionType || 'copy',
      createdAt: new Date().toISOString()
    };
    const updated = [item, ...notifications];
    onUpdateNotifications(updated);
    saveLocalSetting('notifications_list', updated);
    await saveSettingDoc('notifications_list', updated);
    setNewNotif({
      titleAr: '',
      titleEn: '',
      descAr: '',
      descEn: '',
      code: '',
      type: 'discount',
      actionType: 'copy'
    });
    onNotify(isArabic ? 'تم إرسال التنبيه لكافة المستخدمين وحفظه بقاعدة البيانات' : 'VIP Alert broadcasted and saved');
  };

  const handleDeleteNotification = async (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    onUpdateNotifications(updated);
    saveLocalSetting('notifications_list', updated);
    await saveSettingDoc('notifications_list', updated);
    onNotify(isArabic ? 'تم حذف التنبيه من كافة المستخدمين' : 'Notification removed for all users');
  };

  // ---------------------------------------------------------------------------
  // PROMO POPUP HANDLERS
  // ---------------------------------------------------------------------------
  const handleSavePromoPopup = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePromoPopup(promoPopup);
    saveLocalSetting('site_promo_popup', promoPopup);
    await saveSettingDoc('site_promo_popup', promoPopup);
    onNotify(isArabic ? 'تم حفظ إعدادات النافذة المنبثقة بقاعدة البيانات' : 'Promo popup settings saved to Firebase');
  };

  // ---------------------------------------------------------------------------
  // TOP ANNOUNCEMENT TICKER HANDLERS
  // ---------------------------------------------------------------------------
  const handleAddAnnouncementItem = () => {
    if (!newAnnouncementAr.trim()) return;
    const newItem = {
      id: `ann-${Date.now()}`,
      textAr: newAnnouncementAr.trim(),
      textEn: newAnnouncementEn.trim() || newAnnouncementAr.trim()
    };
    const updated = {
      ...topAnnouncement,
      announcements: [...(topAnnouncement.announcements || []), newItem]
    };
    onUpdateTopAnnouncement(updated);
    saveLocalSetting('top_announcement', updated);
    saveSettingDoc('top_announcement', updated);
    setNewAnnouncementAr('');
    setNewAnnouncementEn('');
    onNotify(isArabic ? 'تمت إضافة نص الإعلان' : 'Announcement ticker item added');
  };

  const handleDeleteAnnouncementItem = async (id: string) => {
    const updated = {
      ...topAnnouncement,
      announcements: (topAnnouncement.announcements || []).filter((a) => a.id !== id)
    };
    onUpdateTopAnnouncement(updated);
    saveLocalSetting('top_announcement', updated);
    await saveSettingDoc('top_announcement', updated);
    onNotify(isArabic ? 'تم حذف نص الإعلان' : 'Announcement item removed');
  };

  const handleSaveTopAnnouncement = async () => {
    saveLocalSetting('top_announcement', topAnnouncement);
    await saveSettingDoc('top_announcement', topAnnouncement);
    onNotify(isArabic ? 'تم حفظ شريط الإعلانات أعلى الهيدر بقاعدة البيانات' : 'Header announcements saved');
  };

  // ---------------------------------------------------------------------------
  // HERO BANNER HANDLERS
  // ---------------------------------------------------------------------------
  const handleAddBannerImage = () => {
    if (!newBannerImage.trim()) return;
    const updatedImages = [...(heroBanner.images || []), newBannerImage.trim()];
    const updated = { ...heroBanner, images: updatedImages };
    onUpdateHeroBanner(updated);
    setNewBannerImage('');
  };

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const updatedImages = [...(heroBanner.images || []), reader.result];
        const updated = { ...heroBanner, images: updatedImages };
        onUpdateHeroBanner(updated);
        onNotify(isArabic ? 'تم تحميل وتحديث صورة البنر بنجاح' : 'Banner image uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBannerImage = (index: number) => {
    const updatedImages = (heroBanner.images || []).filter((_, idx) => idx !== index);
    const updated = { ...heroBanner, images: updatedImages };
    onUpdateHeroBanner(updated);
  };

  const handleSaveHeroBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHeroBanner(heroBanner);
    saveLocalSetting('hero_banner', heroBanner);
    await saveSettingDoc('hero_banner', heroBanner);
    onNotify(isArabic ? 'تم حفظ بيانات البنر الإعلاني بقاعدة البيانات' : 'Hero banner settings saved');
  };

  // ---------------------------------------------------------------------------
  // PROMO CODES & FREE SHIPPING HANDLERS
  // ---------------------------------------------------------------------------
  const handleAddPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.code) return;
    const item: PromoCode = {
      id: `promo-${Date.now()}`,
      code: newCode.code.trim().toUpperCase(),
      discountPercent: Number(newCode.discountPercent) || 10,
      minOrder: Number(newCode.minOrder) || 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    const updated = [item, ...promoCodes];
    onUpdatePromoCodes(updated);
    saveLocalSetting('promo_codes', updated);
    await saveSettingDoc('promo_codes', updated);
    setNewCode({ code: '', discountPercent: 10, minOrder: 0, isActive: true });
    onNotify(isArabic ? 'تمت إضافة كود الخصم بقاعدة البيانات' : 'Promo code created');
  };

  const handleTogglePromoCode = async (id: string) => {
    const updated = promoCodes.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    onUpdatePromoCodes(updated);
    saveLocalSetting('promo_codes', updated);
    await saveSettingDoc('promo_codes', updated);
  };

  const handleDeletePromoCode = async (id: string) => {
    const updated = promoCodes.filter((c) => c.id !== id);
    onUpdatePromoCodes(updated);
    saveLocalSetting('promo_codes', updated);
    await saveSettingDoc('promo_codes', updated);
    onNotify(isArabic ? 'تم حذف كود الخصم' : 'Promo code deleted');
  };

  const handleSaveFreeShipping = async () => {
    saveLocalSetting('free_shipping', freeShipping);
    await saveSettingDoc('free_shipping', freeShipping);
    onNotify(isArabic ? 'تم حفظ شروط الشحن المجاني بقاعدة البيانات' : 'Free shipping settings saved');
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('notifications')}
          className={`px-3 py-2 text-xs font-black uppercase rounded transition flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'bg-black text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{isArabic ? 'تنبيهات العروض والإصدارات' : 'VIP Alerts'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-1">
            {notifications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('promo_popup')}
          className={`px-3 py-2 text-xs font-black uppercase rounded transition flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer ${
            activeSubTab === 'promo_popup'
              ? 'bg-black text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isArabic ? 'النافذة المنبثقة الترويجية' : 'Promo Popup'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('announcement_bar')}
          className={`px-3 py-2 text-xs font-black uppercase rounded transition flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer ${
            activeSubTab === 'announcement_bar'
              ? 'bg-black text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isArabic ? 'شريط الإعلانات أعلى الهيدر' : 'Header Announcements'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('hero_banner')}
          className={`px-3 py-2 text-xs font-black uppercase rounded transition flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer ${
            activeSubTab === 'hero_banner'
              ? 'bg-black text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{isArabic ? 'البنر الإعلاني الرئيسي' : 'Hero Banner'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('discounts')}
          className={`px-3 py-2 text-xs font-black uppercase rounded transition flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer ${
            activeSubTab === 'discounts'
              ? 'bg-black text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>{isArabic ? 'أكواد الخصم والشحن المجاني' : 'Discounts & Shipping'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. BROADCAST NOTIFICATIONS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <h4 className="text-sm font-black uppercase text-neutral-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>{isArabic ? 'إرسال وحذف تنبيهات العروض والإصدارات لكافة المستخدمين' : 'Broadcast Alerts Manager'}</span>
            </h4>
            <p className="text-xs text-neutral-500 mt-1">
              {isArabic
                ? 'تظهر هذه التنبيهات في أيقونة الجرس بأعلى الموقع لجميع الزوار. يمكنك إرسال تنبيه فوري أو حذفه من قاعدة البيانات في أي وقت.'
                : 'Alerts appear in the top bell modal for all visitors. Send instant notifications or delete them from Firebase anytime.'}
            </p>
          </div>

          {/* New notification form */}
          <form onSubmit={handleAddNotification} className="bg-white p-4 rounded-lg border border-neutral-200 space-y-3">
            <h5 className="text-xs font-bold text-neutral-800 uppercase">
              {isArabic ? '+ إرسال تنبيه جديد لكافة العملاء' : '+ Broadcast New Alert'}
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  {isArabic ? 'عنوان التنبيه (عربي) *' : 'Alert Title (Arabic) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isArabic ? 'مثال: خصم 15% بمناسبة إطلاق التشكيلة الجديدة' : 'e.g. 15% Launch Discount'}
                  value={newNotif.titleAr || ''}
                  onChange={(e) => setNewNotif({ ...newNotif, titleAr: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  {isArabic ? 'عنوان التنبيه (إنجليزي)' : 'Alert Title (English)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15% Launch Special Voucher"
                  value={newNotif.titleEn || ''}
                  onChange={(e) => setNewNotif({ ...newNotif, titleEn: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  {isArabic ? 'نص وتفاصيل التنبيه (عربي) *' : 'Alert Details (Arabic) *'}
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder={isArabic ? 'اكتب تفاصيل العرض أو الإصدار الجديد هنا...' : 'Write message details...'}
                  value={newNotif.descAr || ''}
                  onChange={(e) => setNewNotif({ ...newNotif, descAr: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  {isArabic ? 'نص وتفاصيل التنبيه (إنجليزي)' : 'Alert Details (English)'}
                </label>
                <textarea
                  rows={2}
                  placeholder="Details in English..."
                  value={newNotif.descEn || ''}
                  onChange={(e) => setNewNotif({ ...newNotif, descEn: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  {isArabic ? 'كود الخصم المقترن (اختياري)' : 'Promo Code (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="مثال: SOTRA15"
                  value={newNotif.code || ''}
                  onChange={(e) => setNewNotif({ ...newNotif, code: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  {isArabic ? 'نوع التنبيه' : 'Alert Type'}
                </label>
                <select
                  value={newNotif.type}
                  onChange={(e) => setNewNotif({ ...newNotif, type: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-medium cursor-pointer"
                >
                  <option value="discount">{isArabic ? 'كود خصم وعروض' : 'Discount / Voucher'}</option>
                  <option value="drop">{isArabic ? 'إصدار أو تشكيلة جديدة' : 'Drop / Restock'}</option>
                  <option value="announcement">{isArabic ? 'إعلان عام للمتجر' : 'General Announcement'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  {isArabic ? 'زر الإجراء للمستخدم' : 'Action Button'}
                </label>
                <select
                  value={newNotif.actionType}
                  onChange={(e) => setNewNotif({ ...newNotif, actionType: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-medium cursor-pointer"
                >
                  <option value="copy">{isArabic ? 'نسخ كود الخصم وتطبيقه' : 'Copy Promo Code'}</option>
                  <option value="shop">{isArabic ? 'تسوق التشكيلة فوراً' : 'Shop Now'}</option>
                  <option value="none">{isArabic ? 'بدون زر إجراء' : 'None'}</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold rounded text-xs flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{isArabic ? 'إرسال التنبيه وحفظه بقاعدة البيانات' : 'Broadcast Alert'}</span>
              </button>
            </div>
          </form>

          {/* Active notifications list */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-neutral-800 uppercase flex items-center justify-between">
              <span>{isArabic ? 'التنبيهات الحالية النشطة لدى المستخدمين' : 'Active Broadcast Alerts'}</span>
              <span className="text-neutral-500 font-normal">({notifications.length})</span>
            </h5>

            {notifications.length === 0 ? (
              <div className="bg-white p-8 rounded-lg border border-neutral-200 text-center text-xs text-neutral-500">
                {isArabic
                  ? 'لا توجد تنبيهات حالية مضافة في قاعدة البيانات. أضف أول تنبيه في النموذج أعلاه.'
                  : 'No active notifications in Firestore. Add one above.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                          {notif.type}
                        </span>
                        {notif.code && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900 text-white">
                            {notif.code}
                          </span>
                        )}
                        <h6 className="font-bold text-xs sm:text-sm text-neutral-900">
                          {isArabic ? notif.titleAr : notif.titleEn || notif.titleAr}
                        </h6>
                      </div>
                      <p className="text-xs text-neutral-600">
                        {isArabic ? notif.descAr : notif.descEn || notif.descAr}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition border border-red-200 flex items-center space-x-1 rtl:space-x-reverse shrink-0 cursor-pointer self-end sm:self-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'حذف من المستخدمين' : 'Delete Alert'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SITE PROMO POPUP TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'promo_popup' && (
        <form onSubmit={handleSavePromoPopup} className="bg-white p-5 rounded-lg border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div>
              <h4 className="text-sm font-black uppercase text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{isArabic ? 'إعدادات النافذة المنبثقة الترويجية (Popup Modal)' : 'Site Promo Popup Settings'}</span>
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                {isArabic
                  ? 'تظهر تلقائياً للزوار عند الدخول مع إمكانية عرض صورة العرض، كود الخصم، وزر التوجيه.'
                  : 'Displays to store visitors upon arrival with promotional imagery, coupon, and action link.'}
              </p>
            </div>

            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
              <span className="text-xs font-bold text-neutral-800">
                {isArabic ? 'تفعيل النافذة' : 'Enable Popup'}
              </span>
              <input
                type="checkbox"
                checked={promoPopup.enabled}
                onChange={(e) => onUpdatePromoPopup({ ...promoPopup, enabled: e.target.checked })}
                className="w-4 h-4 accent-black cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'رابط صورة النافذة (Image URL)' : 'Popup Image URL'}
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={promoPopup.imageUrl || ''}
                onChange={(e) => onUpdatePromoPopup({ ...promoPopup, imageUrl: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'كود الخصم المعروض في النافذة' : 'Displayed Promo Code'}
              </label>
              <input
                type="text"
                placeholder="SOTRA10"
                value={promoPopup.promoCode || ''}
                onChange={(e) => onUpdatePromoPopup({ ...promoPopup, promoCode: e.target.value.toUpperCase() })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-mono uppercase font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'العنوان الرئيسي (عربي)' : 'Title (Arabic)'}
              </label>
              <input
                type="text"
                value={promoPopup.titleAr || ''}
                onChange={(e) => onUpdatePromoPopup({ ...promoPopup, titleAr: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'العنوان الرئيسي (إنجليزي)' : 'Title (English)'}
              </label>
              <input
                type="text"
                value={promoPopup.titleEn || ''}
                onChange={(e) => onUpdatePromoPopup({ ...promoPopup, titleEn: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'العنوان الفرعي / الوصف (عربي)' : 'Subtitle (Arabic)'}
              </label>
              <textarea
                rows={2}
                value={promoPopup.subtitleAr || ''}
                onChange={(e) => onUpdatePromoPopup({ ...promoPopup, subtitleAr: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'العنوان الفرعي / الوصف (إنجليزي)' : 'Subtitle (English)'}
              </label>
              <textarea
                rows={2}
                value={promoPopup.subtitleEn || ''}
                onChange={(e) => onUpdatePromoPopup({ ...promoPopup, subtitleEn: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'نص الزر (عربي)' : 'Button Label (Arabic)'}
              </label>
              <input
                type="text"
                value={promoPopup.buttonTextAr || ''}
                onChange={(e) => onUpdatePromoPopup({ ...promoPopup, buttonTextAr: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'نص الزر (إنجليزي)' : 'Button Label (English)'}
              </label>
              <input
                type="text"
                value={promoPopup.buttonTextEn || ''}
                onChange={(e) => onUpdatePromoPopup({ ...promoPopup, buttonTextEn: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold rounded text-xs flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isArabic ? 'حفظ إعدادات النافذة المنبثقة' : 'Save Promo Popup'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. HEADER ANNOUNCEMENT BAR TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'announcement_bar' && (
        <div className="bg-white p-5 rounded-lg border border-neutral-200 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div>
              <h4 className="text-sm font-black uppercase text-neutral-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>{isArabic ? 'شريط الإعلانات أعلى الهيدر (Header Announcement Ticker)' : 'Top Header Announcement Ticker'}</span>
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                {isArabic
                  ? 'الشريط الأسود المتحرك أعلى المتجر، يمكنك تفعيله وإضافة نصوص الإعلانات وتعديلها وحفظها في فايربيس.'
                  : 'The top notification ticker bar above the header. Fully manageable and synced to Firebase.'}
              </p>
            </div>

            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
              <span className="text-xs font-bold text-neutral-800">
                {isArabic ? 'تفعيل الشريط' : 'Enable Bar'}
              </span>
              <input
                type="checkbox"
                checked={topAnnouncement.enabled}
                onChange={(e) => onUpdateTopAnnouncement({ ...topAnnouncement, enabled: e.target.checked })}
                className="w-4 h-4 accent-black cursor-pointer"
              />
            </label>
          </div>

          {/* Add item */}
          <div className="bg-neutral-50 p-3.5 rounded border border-neutral-200 space-y-3">
            <h5 className="text-xs font-bold text-neutral-800 uppercase">
              {isArabic ? '+ إضافة نص إعلاني متحرك جديد' : '+ Add Ticker Announcement'}
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={isArabic ? 'نص الإعلان (عربي) *' : 'Announcement text (Arabic)'}
                value={newAnnouncementAr}
                onChange={(e) => setNewAnnouncementAr(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-medium"
              />
              <input
                type="text"
                placeholder={isArabic ? 'نص الإعلان (إنجليزي)' : 'Announcement text (English)'}
                value={newAnnouncementEn}
                onChange={(e) => setNewAnnouncementEn(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-medium"
              />
            </div>
            <button
              type="button"
              onClick={handleAddAnnouncementItem}
              className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold rounded text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إضافة إلى الشريط' : 'Add to Ticker'}</span>
            </button>
          </div>

          {/* Items list */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-neutral-800 uppercase">
              {isArabic ? 'النصوص المعروضة حالياً' : 'Current Ticker Items'}
            </h5>
            {(topAnnouncement.announcements || []).map((ann, idx) => (
              <div
                key={ann.id}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded border border-neutral-200 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-neutral-900 block">{ann.textAr}</span>
                  <span className="text-[11px] text-neutral-500 font-mono block">{ann.textEn}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAnnouncementItem(ann.id)}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveTopAnnouncement}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold rounded text-xs flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isArabic ? 'حفظ شريط الإعلانات في قاعدة البيانات' : 'Save Header Ticker'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. HERO BANNER TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'hero_banner' && (
        <form onSubmit={handleSaveHeroBanner} className="bg-white p-5 rounded-lg border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div>
              <h4 className="text-sm font-black uppercase text-neutral-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>{isArabic ? 'البنر الإعلاني الرئيسي للمتجر (Hero Banner)' : 'Main Store Hero Banner'}</span>
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                {isArabic
                  ? 'يحدد صور السلايدر، العناوين، الشارات الترويجية وأزرار التوجيه في الصفحة الرئيسية مباشرة من فايربيس.'
                  : 'Manage rotating background slides, headlines, badges, and button links from Firebase.'}
              </p>
            </div>

            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
              <span className="text-xs font-bold text-neutral-800">
                {isArabic ? 'تفعيل البنر' : 'Enable Hero Banner'}
              </span>
              <input
                type="checkbox"
                checked={heroBanner.enabled}
                onChange={(e) => onUpdateHeroBanner({ ...heroBanner, enabled: e.target.checked })}
                className="w-4 h-4 accent-black cursor-pointer"
              />
            </label>
          </div>

          {/* Slides Images Manager */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-neutral-700">
              {isArabic ? 'صور السلايدر المتحرك (Slide Images)' : 'Hero Slide Images'}
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newBannerImage}
                onChange={(e) => setNewBannerImage(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-mono"
              />
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAddBannerImage}
                  className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold rounded text-xs cursor-pointer"
                >
                  {isArabic ? 'إضافة بالرابط' : 'Add URL'}
                </button>
                <label className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded text-xs cursor-pointer border border-neutral-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'رفع صورة' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {(heroBanner.images || []).map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-[16/9] rounded overflow-hidden border border-neutral-200 group">
                  <img src={imgUrl} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveBannerImage(idx)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded shadow-xs opacity-90 hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Banner Text Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'العنوان الرئيسي (عربي)' : 'Headline (Arabic)'}
              </label>
              <input
                type="text"
                value={heroBanner.headlineAr || ''}
                onChange={(e) => onUpdateHeroBanner({ ...heroBanner, headlineAr: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'العنوان الرئيسي (إنجليزي)' : 'Headline (English)'}
              </label>
              <input
                type="text"
                value={heroBanner.headlineEn || ''}
                onChange={(e) => onUpdateHeroBanner({ ...heroBanner, headlineEn: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'الوصف الترويجي (عربي)' : 'Subtitle (Arabic)'}
              </label>
              <textarea
                rows={2}
                value={heroBanner.subtitleAr || ''}
                onChange={(e) => onUpdateHeroBanner({ ...heroBanner, subtitleAr: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'الوصف الترويجي (إنجليزي)' : 'Subtitle (English)'}
              </label>
              <textarea
                rows={2}
                value={heroBanner.subtitleEn || ''}
                onChange={(e) => onUpdateHeroBanner({ ...heroBanner, subtitleEn: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'الشارة الترويجية (Badge العربي)' : 'Promo Badge (Arabic)'}
              </label>
              <input
                type="text"
                value={heroBanner.badgeAr || ''}
                onChange={(e) => onUpdateHeroBanner({ ...heroBanner, badgeAr: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {isArabic ? 'رابط التوجيه لزر البنر' : 'Button Target Link'}
              </label>
              <input
                type="text"
                value={heroBanner.buttonLink || '#products-catalog'}
                onChange={(e) => onUpdateHeroBanner({ ...heroBanner, buttonLink: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-mono"
              />
            </div>
          </div>

          {/* Sections Below Banner & New Arrivals Controller */}
          <div className="pt-4 border-t border-neutral-200 space-y-4">
            <div>
              <h5 className="text-xs font-black uppercase text-neutral-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>{isArabic ? 'التحكم بالأقسام وعرضها بالصفحة الرئيسية (أسفل البنر ووصل حديثاً)' : 'Homepage Sections Controller'}</span>
              </h5>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {isArabic
                  ? 'يمكنك هنا إظهار أو إخفاء الأقسام الموجودة أسفل البنر ووصل حديثاً، مع تخصيص عناوين كل قسم.'
                  : 'Show, hide, or customize section titles below Hero Banner and New Arrivals.'}
              </p>
            </div>

            {/* Section 1: New Arrivals */}
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900">
                  {isArabic ? 'قسم: وصل حديثاً (New Arrivals)' : 'Section: New Arrivals'}
                </span>
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <span className="text-[11px] font-bold text-neutral-700">
                    {heroBanner.showNewArrivals !== false ? (isArabic ? 'مفعل ويظهر' : 'Visible') : (isArabic ? 'مخفي' : 'Hidden')}
                  </span>
                  <input
                    type="checkbox"
                    checked={heroBanner.showNewArrivals !== false}
                    onChange={(e) => onUpdateHeroBanner({ ...heroBanner, showNewArrivals: e.target.checked })}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">{isArabic ? 'عنوان القسم (عربي):' : 'Title (Arabic):'}</label>
                  <input
                    type="text"
                    placeholder="وصل حديثاً"
                    value={heroBanner.newArrivalsTitleAr || ''}
                    onChange={(e) => onUpdateHeroBanner({ ...heroBanner, newArrivalsTitleAr: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">{isArabic ? 'عنوان القسم (إنجليزي):' : 'Title (English):'}</label>
                  <input
                    type="text"
                    placeholder="NEW ARRIVALS"
                    value={heroBanner.newArrivalsTitleEn || ''}
                    onChange={(e) => onUpdateHeroBanner({ ...heroBanner, newArrivalsTitleEn: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Best Sellers */}
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900">
                  {isArabic ? 'قسم: الأكثر مبيعاً (Best Sellers)' : 'Section: Best Sellers'}
                </span>
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <span className="text-[11px] font-bold text-neutral-700">
                    {heroBanner.showBestSellers !== false ? (isArabic ? 'مفعل ويظهر' : 'Visible') : (isArabic ? 'مخفي' : 'Hidden')}
                  </span>
                  <input
                    type="checkbox"
                    checked={heroBanner.showBestSellers !== false}
                    onChange={(e) => onUpdateHeroBanner({ ...heroBanner, showBestSellers: e.target.checked })}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">{isArabic ? 'عنوان القسم (عربي):' : 'Title (Arabic):'}</label>
                  <input
                    type="text"
                    placeholder="الأكثر مبيعاً"
                    value={heroBanner.bestSellersTitleAr || ''}
                    onChange={(e) => onUpdateHeroBanner({ ...heroBanner, bestSellersTitleAr: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">{isArabic ? 'عنوان القسم (إنجليزي):' : 'Title (English):'}</label>
                  <input
                    type="text"
                    placeholder="BEST SELLERS"
                    value={heroBanner.bestSellersTitleEn || ''}
                    onChange={(e) => onUpdateHeroBanner({ ...heroBanner, bestSellersTitleEn: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Shop by Category */}
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900">
                  {isArabic ? 'قسم: تسوق حسب الأقسام (Shop By Category)' : 'Section: Shop By Category'}
                </span>
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <span className="text-[11px] font-bold text-neutral-700">
                    {heroBanner.showShopByCategory !== false ? (isArabic ? 'مفعل ويظهر' : 'Visible') : (isArabic ? 'مخفي' : 'Hidden')}
                  </span>
                  <input
                    type="checkbox"
                    checked={heroBanner.showShopByCategory !== false}
                    onChange={(e) => onUpdateHeroBanner({ ...heroBanner, showShopByCategory: e.target.checked })}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">{isArabic ? 'عنوان القسم (عربي):' : 'Title (Arabic):'}</label>
                  <input
                    type="text"
                    placeholder="تسوق حسب الأقسام"
                    value={heroBanner.shopByCategoryTitleAr || ''}
                    onChange={(e) => onUpdateHeroBanner({ ...heroBanner, shopByCategoryTitleAr: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">{isArabic ? 'عنوان القسم (إنجليزي):' : 'Title (English):'}</label>
                  <input
                    type="text"
                    placeholder="SHOP BY CATEGORY"
                    value={heroBanner.shopByCategoryTitleEn || ''}
                    onChange={(e) => onUpdateHeroBanner({ ...heroBanner, shopByCategoryTitleEn: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold rounded text-xs flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isArabic ? 'حفظ البنر الإعلاني بقاعدة البيانات' : 'Save Hero Banner'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 5. PROMO CODES & FREE SHIPPING TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'discounts' && (
        <div className="space-y-5">
          {/* Free shipping threshold box */}
          <div className="bg-white p-5 rounded-lg border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h4 className="text-sm font-black uppercase text-neutral-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span>{isArabic ? 'حد الشحن المجاني (أضف بقيمة LE للحصول على شحن مجاني!)' : 'Free Shipping Threshold'}</span>
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {isArabic
                    ? 'يحدد القيمة المطلوبة في سلة المشتريات للحصول على شحن مجاني في شريط التقدم.'
                    : 'Configures the required cart subtotal for free delivery.'}
                </p>
              </div>

              <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                <span className="text-xs font-bold text-neutral-800">
                  {isArabic ? 'تفعيل مقياس الشحن المجاني' : 'Enable Free Shipping Bar'}
                </span>
                <input
                  type="checkbox"
                  checked={freeShipping.enabled}
                  onChange={(e) => onUpdateFreeShipping({ ...freeShipping, enabled: e.target.checked })}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  {isArabic ? 'الحد الأدنى للطلب بالجنيه المصري (LE) للحصول على شحن مجاني:' : 'Minimum Cart Value (LE) for Free Shipping:'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={freeShipping.threshold}
                  onChange={(e) => onUpdateFreeShipping({ ...freeShipping, threshold: Number(e.target.value) || 0 })}
                  className="w-full sm:w-60 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveFreeShipping}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold rounded text-xs flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer shadow-xs self-end sm:self-auto"
              >
                <Save className="w-4 h-4" />
                <span>{isArabic ? 'حفظ حد الشحن المجاني' : 'Save Threshold'}</span>
              </button>
            </div>
          </div>

          {/* Promo Codes Manager */}
          <div className="bg-white p-5 rounded-lg border border-neutral-200 space-y-4">
            <h4 className="text-sm font-black uppercase text-neutral-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-600" />
              <span>{isArabic ? 'إدارة أكواد الخصم الترويجية (Promo Codes)' : 'Manage Promo Codes'}</span>
            </h4>

            {/* Add code form */}
            <form onSubmit={handleAddPromoCode} className="bg-neutral-50 p-3.5 rounded border border-neutral-200 space-y-3">
              <h5 className="text-xs font-bold text-neutral-800 uppercase">
                {isArabic ? '+ إنشاء كود خصم جديد' : '+ Create New Promo Code'}
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {isArabic ? 'رمز الكود (مثال: SOTRA10) *' : 'Code String (e.g. SOTRA10) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="SOTRA15"
                    value={newCode.code || ''}
                    onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {isArabic ? 'نسبة الخصم % *' : 'Discount Percentage % *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={newCode.discountPercent || 10}
                    onChange={(e) => setNewCode({ ...newCode, discountPercent: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {isArabic ? 'الحد الأدنى للطلب (LE)' : 'Min Order (LE)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCode.minOrder || 0}
                    onChange={(e) => setNewCode({ ...newCode, minOrder: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold rounded text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'إضافة الكود لقاعدة البيانات' : 'Add Promo Code'}</span>
                </button>
              </div>
            </form>

            {/* List of promo codes */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-neutral-800 uppercase">
                {isArabic ? 'الأكواد المتاحة في المتجر' : 'Active Promo Codes'}
              </h5>

              {promoCodes.length === 0 ? (
                <p className="text-xs text-neutral-500 py-3 text-center">
                  {isArabic ? 'لا توجد أكواد خصم مضافة حالياً.' : 'No promo codes created.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {promoCodes.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-sm text-neutral-900">{c.code}</span>
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded">
                            -{c.discountPercent}%
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500 block">
                          {c.minOrder && c.minOrder > 0
                            ? isArabic
                              ? `للطلبات أكثر من ${c.minOrder} ج.م`
                              : `Min order: ${c.minOrder} LE`
                            : isArabic
                            ? 'بدون حد أدنى'
                            : 'No min order'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePromoCode(c.id)}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                            c.isActive ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {c.isActive ? (isArabic ? 'مفعل' : 'Active') : (isArabic ? 'معطل' : 'Disabled')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePromoCode(c.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
