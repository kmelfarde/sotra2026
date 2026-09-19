import React, { useState } from 'react';
import { Save, Smartphone, Truck, Headset, Bell, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Product, StoreCategory, WalletSettings, GovernorateRate, SupportSettings, BroadcastNotification, SitePromoPopup, FooterSettings } from '../../types';
import {
  getWalletSettings,
  getGovernoratesRates,
  getSupportSettings,
  getBroadcastNotification,
  getPromoPopupSettings,
  getFooterSettings,
  saveLocalSetting
} from '../../utils/storeSettings';
import { saveSettingDoc } from '../../firebase/db';

interface AdminSettingsTabProps {
  products: Product[];
  categories: StoreCategory[];
  isArabic: boolean;
  onNotify: (msg: string) => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  products,
  categories,
  isArabic,
  onNotify
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'wallets' | 'shipping' | 'support' | 'announcements' | 'footer'>('wallets');

  const [wallet, setWallet] = useState<WalletSettings>(() => getWalletSettings());
  const [govs, setGovs] = useState<GovernorateRate[]>(() => getGovernoratesRates());
  const [support, setSupport] = useState<SupportSettings>(() => getSupportSettings());
  const [broadcast, setBroadcast] = useState<BroadcastNotification>(() => getBroadcastNotification());
  const [promo, setPromo] = useState<SitePromoPopup>(() => getPromoPopupSettings());
  const [footer, setFooter] = useState<FooterSettings>(() => getFooterSettings());

  const handleSaveWallets = async () => {
    saveLocalSetting('wallet', wallet);
    await saveSettingDoc('wallet', wallet);
    onNotify(isArabic ? 'تم حفظ إعدادات المحافظ الإلكترونية بنجاح' : 'Wallet settings saved');
  };

  const handleSaveShipping = async () => {
    saveLocalSetting('governorates', govs);
    await saveSettingDoc('governorates', govs);
    onNotify(isArabic ? 'تم حفظ أسعار الشحن لكافة المحافظات بنجاح' : 'Shipping rates saved');
  };

  const handleSaveSupport = async () => {
    saveLocalSetting('support', support);
    await saveSettingDoc('support', support);
    onNotify(isArabic ? 'تم حفظ بيانات خدمة العملاء بنجاح' : 'Support settings saved');
  };

  const handleSaveAnnouncements = async () => {
    saveLocalSetting('broadcast_notification', broadcast);
    await saveSettingDoc('broadcast_notification', broadcast);
    saveLocalSetting('site_promo_popup', promo);
    await saveSettingDoc('site_promo_popup', promo);
    onNotify(isArabic ? 'تم حفظ إعدادات البانر والنافذة الترويجية' : 'Announcements & Promo saved');
  };

  const handleSaveFooter = async () => {
    saveLocalSetting('footer', footer);
    await saveSettingDoc('footer', footer);
    onNotify(isArabic ? 'تم حفظ إعدادات الفوتر وروابط التواصل' : 'Footer settings saved');
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
        {[
          { id: 'wallets', labelAr: 'المحافظ والدفع الإلكتروني', labelEn: 'Wallets & Payment', icon: Smartphone },
          { id: 'shipping', labelAr: 'أسعار الشحن للمحافظات', labelEn: 'Shipping Rates', icon: Truck },
          { id: 'support', labelAr: 'خدمة العملاء والواتساب', labelEn: 'Customer Support', icon: Headset },
          { id: 'announcements', labelAr: 'شريط الإعلانات والنافذة', labelEn: 'Announcements & Promo', icon: Bell },
          { id: 'footer', labelAr: 'الفوتر ومواقع التواصل', labelEn: 'Footer & Socials', icon: CheckCircle2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* WALLETS SUBTAB */}
      {activeSubTab === 'wallets' && (
        <div className="p-4 sm:p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h4 className="text-sm font-black text-neutral-900">
                {isArabic ? 'إعدادات وسائل الدفع والمحافظ الإلكترونية' : 'Payment Wallets & Methods'}
              </h4>
              <p className="text-xs text-neutral-500">
                {isArabic ? 'حدد أرقام الاستلام وإلزامية دفع رسوم الشحن مقدماً' : 'Configure payment gateways and advance shipping deposits'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveWallets}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isArabic ? 'حفظ التغييرات' : 'Save'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {isArabic ? 'رقم فودافون كاش' : 'Vodafone Cash Number'}
              </label>
              <input
                type="text"
                value={wallet.vodafoneCash}
                onChange={(e) => setWallet({ ...wallet, vodafoneCash: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-black outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {isArabic ? 'معرف انستاباي (InstaPay Handle/IPA)' : 'InstaPay Handle / Address'}
              </label>
              <input
                type="text"
                value={wallet.instapayHandle}
                onChange={(e) => setWallet({ ...wallet, instapayHandle: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-black outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {isArabic ? 'رقم هاتف انستاباي' : 'InstaPay Phone Number'}
              </label>
              <input
                type="text"
                value={wallet.instapayPhone}
                onChange={(e) => setWallet({ ...wallet, instapayPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-black outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {isArabic ? 'رقم أورنج كاش' : 'Orange Cash Number'}
              </label>
              <input
                type="text"
                value={wallet.orangeCash}
                onChange={(e) => setWallet({ ...wallet, orangeCash: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-black outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-900 block">
                {isArabic ? 'إلزامية تحويل مصاريف الشحن لجدية الطلب' : 'Mandatory advance shipping fee'}
              </span>
              <span className="text-[11px] text-neutral-500">
                {isArabic ? 'يطلب من العميل إرفاق رقم التحويل لمصاريف الشحن لتأكيد الطلب' : 'Require transfer verification for courier fee'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={wallet.requireShippingPayment}
              onChange={(e) => setWallet({ ...wallet, requireShippingPayment: e.target.checked })}
              className="w-4 h-4 accent-black cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* SHIPPING SUBTAB */}
      {activeSubTab === 'shipping' && (
        <div className="p-4 sm:p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h4 className="text-sm font-black text-neutral-900">
                {isArabic ? 'أسعار الشحن لكافة محافظات الجمهورية' : 'Nationwide Shipping Rates'}
              </h4>
              <p className="text-xs text-neutral-500">
                {isArabic ? 'تعديل تكلفة التوصيل لكل محافظة بالجنيه المصري' : 'Set custom shipping costs per governorate in EGP'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveShipping}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isArabic ? 'حفظ الأسعار' : 'Save Rates'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {govs.map((gov, idx) => (
              <div key={gov.id} className="p-2.5 border border-neutral-200 rounded flex items-center justify-between gap-2 bg-neutral-50/50">
                <span className="text-xs font-bold text-neutral-900 truncate">
                  {isArabic ? gov.nameAr : gov.nameEn}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={gov.fee}
                    onChange={(e) => {
                      const updated = [...govs];
                      updated[idx].fee = Number(e.target.value) || 0;
                      setGovs(updated);
                    }}
                    className="w-16 px-2 py-1 text-xs border border-neutral-300 rounded bg-white text-center font-black focus:border-black outline-none"
                  />
                  <span className="text-[10px] text-neutral-500 font-bold">{isArabic ? 'ج.م' : 'EGP'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUPPORT SUBTAB */}
      {activeSubTab === 'support' && (
        <div className="p-4 sm:p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h4 className="text-sm font-black text-neutral-900">
                {isArabic ? 'إعدادات التواصل وواتساب المباشر' : 'Customer Support & WhatsApp'}
              </h4>
              <p className="text-xs text-neutral-500">
                {isArabic ? 'الرقم الذي يستقبل رسائل الدعم الفني واستفسارات العملاء' : 'The number connected to all floating support widgets'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveSupport}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isArabic ? 'حفظ الرقم' : 'Save Number'}</span>
            </button>
          </div>

          <div className="space-y-3 max-w-md">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {isArabic ? 'رقم الواتساب الدولي (مع كود الدولة مثل 2010...)' : 'WhatsApp Phone (with Country Code)'}
              </label>
              <input
                type="text"
                value={support.whatsappPhone}
                onChange={(e) => setSupport({ ...support, whatsappPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-black outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {isArabic ? 'الرقم المعروض للعملاء في الموقع' : 'Display Phone'}
              </label>
              <input
                type="text"
                value={support.whatsappDisplay}
                onChange={(e) => setSupport({ ...support, whatsappDisplay: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-black outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS SUBTAB */}
      {activeSubTab === 'announcements' && (
        <div className="p-4 sm:p-6 bg-white border border-neutral-200 rounded-xl space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h4 className="text-sm font-black text-neutral-900">
                {isArabic ? 'الشريط العلوي والنافذة الترويجية المنبثقة' : 'Broadcast Banner & Promo Popup'}
              </h4>
              <p className="text-xs text-neutral-500">
                {isArabic ? 'التحكم في تنبيهات المتجر والعروض الترويجية' : 'Manage top header alerts and entrance modal popups'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveAnnouncements}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isArabic ? 'حفظ الإعلانات' : 'Save'}</span>
            </button>
          </div>

          {/* Broadcast Banner */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-neutral-900 uppercase">
                {isArabic ? 'الشريط الإعلاني العلوي' : 'Top Broadcast Banner'}
              </span>
              <input
                type="checkbox"
                checked={broadcast.enabled}
                onChange={(e) => setBroadcast({ ...broadcast, enabled: e.target.checked })}
                className="w-4 h-4 accent-black cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  {isArabic ? 'نص الإعلان (عربي)' : 'Announcement (Arabic)'}
                </label>
                <input
                  type="text"
                  value={broadcast.message}
                  onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:border-black outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  {isArabic ? 'نص الإعلان (إنجليزي)' : 'Announcement (English)'}
                </label>
                <input
                  type="text"
                  value={broadcast.messageEn || ''}
                  onChange={(e) => setBroadcast({ ...broadcast, messageEn: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:border-black outline-none"
                />
              </div>
            </div>
          </div>

          {/* Promo Popup */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-neutral-900 uppercase">
                {isArabic ? 'النافذة المنبثقة الترويجية عند فتح المتجر' : 'Entrance Promo Popup'}
              </span>
              <input
                type="checkbox"
                checked={promo.enabled}
                onChange={(e) => setPromo({ ...promo, enabled: e.target.checked })}
                className="w-4 h-4 accent-black cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                {isArabic ? 'رابط صورة الإعلان (URL)' : 'Promo Image URL'}
              </label>
              <input
                type="text"
                value={promo.imageUrl}
                onChange={(e) => setPromo({ ...promo, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:border-black outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* FOOTER SUBTAB */}
      {activeSubTab === 'footer' && (
        <div className="p-4 sm:p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h4 className="text-sm font-black text-neutral-900">
                {isArabic ? 'إعدادات الفوتر ومواقع التواصل الاجتماعي' : 'Footer & Social Links'}
              </h4>
              <p className="text-xs text-neutral-500">
                {isArabic ? 'تعديل روابط إنستغرام وتيك توك والنصوص التعريفية' : 'Configure brand social links and footer pillars'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveFooter}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isArabic ? 'حفظ الفوتر' : 'Save'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Instagram URL</label>
              <input
                type="text"
                value={footer.instagramUrl}
                onChange={(e) => setFooter({ ...footer, instagramUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-black outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">TikTok URL</label>
              <input
                type="text"
                value={footer.tiktokUrl}
                onChange={(e) => setFooter({ ...footer, tiktokUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-black outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Facebook URL</label>
              <input
                type="text"
                value={footer.facebookUrl}
                onChange={(e) => setFooter({ ...footer, facebookUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-black outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
