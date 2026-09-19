import React, { useState, useEffect } from 'react';
import { RefreshCw, Truck, Award, Instagram, Facebook, Music2 } from 'lucide-react';
import { getFooterSettings } from '../utils/storeSettings';
import { FooterSettings } from '../types';

interface FooterProps {
  onOpenCategory?: (cat: any) => void;
  onOpenSizeGuide?: () => void;
  onOpenOrderTracking: () => void;
  onOpenProfile?: () => void;
  onOpenAdminLogin?: () => void;
  onAdminTrigger?: () => void;
  isArabic: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCategory,
  onOpenSizeGuide,
  onOpenOrderTracking,
  onOpenProfile,
  onOpenAdminLogin,
  onAdminTrigger,
  isArabic
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(() => getFooterSettings());

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setFooterSettings(getFooterSettings());
    };
    window.addEventListener('sotra_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('sotra_settings_updated', handleSettingsUpdate);
  }, []);

  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 4000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleLogoClick = () => {
    const nextCount = clickCount + 1;
    if (nextCount >= 10) {
      setClickCount(0);
      const adminCb = onOpenAdminLogin || onAdminTrigger;
      adminCb?.();
    } else {
      setClickCount(nextCount);
    }
  };

  return (
    <footer className="w-full bg-neutral-950 text-white border-t border-neutral-800">
      {/* 3 Core Assurance Pillars */}
      <div className="border-b border-neutral-800/80 py-7 px-4 sm:px-6 bg-neutral-900/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Pillar 1 */}
          <div className="flex items-center space-x-3.5 rtl:space-x-reverse p-3 rounded bg-neutral-900/60 border border-neutral-800">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                {isArabic ? footerSettings.pillar1TitleAr : (footerSettings.pillar1TitleEn || footerSettings.pillar1TitleAr)}
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                {isArabic ? footerSettings.pillar1DescAr : (footerSettings.pillar1DescEn || footerSettings.pillar1DescAr)}
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-center space-x-3.5 rtl:space-x-reverse p-3 rounded bg-neutral-900/60 border border-neutral-800">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 text-white">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                {isArabic ? footerSettings.pillar2TitleAr : (footerSettings.pillar2TitleEn || footerSettings.pillar2TitleAr)}
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                {isArabic ? footerSettings.pillar2DescAr : (footerSettings.pillar2DescEn || footerSettings.pillar2DescAr)}
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-center space-x-3.5 rtl:space-x-reverse p-3 rounded bg-neutral-900/60 border border-neutral-800">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                {isArabic ? footerSettings.pillar3TitleAr : (footerSettings.pillar3TitleEn || footerSettings.pillar3TitleAr)}
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                {isArabic ? footerSettings.pillar3DescAr : (footerSettings.pillar3DescEn || footerSettings.pillar3DescAr)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10">
          {/* Brand Info & Social Column */}
          <div className="md:col-span-5 space-y-4">
            <div
              onClick={handleLogoClick}
              className="flex flex-col select-none inline-block w-fit cursor-pointer"
              title=""
            >
              <span className="font-black text-3xl tracking-[0.25em] font-stencil uppercase text-white hover:text-neutral-200 transition">
                SOTRA
              </span>
              <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-400 -mt-1 font-bold">
                fashion
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              {isArabic ? footerSettings.aboutTextAr : footerSettings.aboutTextEn}
            </p>

            {/* Social Media Channels */}
            <div className="pt-2 space-y-2.5">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {isArabic ? 'تابعنا وتفاعل مع مجتمع سوترة:' : 'Connect with SOTRA community:'}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {footerSettings.instagramUrl && (
                  <a
                    href={footerSettings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-pink-500/60 flex items-center space-x-2 rtl:space-x-reverse text-neutral-300 hover:text-white transition group cursor-pointer"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold">{isArabic ? 'إنستغرام' : 'Instagram'}</span>
                  </a>
                )}

                {footerSettings.tiktokUrl && (
                  <a
                    href={footerSettings.tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-400/60 flex items-center space-x-2 rtl:space-x-reverse text-neutral-300 hover:text-white transition group cursor-pointer"
                    aria-label="TikTok"
                  >
                    <Music2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold">{isArabic ? 'تيك توك' : 'TikTok'}</span>
                  </a>
                )}

                {footerSettings.facebookUrl && (
                  <a
                    href={footerSettings.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-blue-500/60 flex items-center space-x-2 rtl:space-x-reverse text-neutral-300 hover:text-white transition group cursor-pointer"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold">{isArabic ? 'فيسبوك' : 'Facebook'}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="font-black uppercase tracking-wider text-white">
              {isArabic ? 'أقسام المتجر' : 'Collections'}
            </h4>
            <ul className="space-y-2 text-neutral-400 font-medium">
              <li>
                <a href="#products-catalog" className="hover:text-white transition">
                  {isArabic ? 'التيشيرتات والأوفرسايز' : 'Oversized & Tees'}
                </a>
              </li>
              <li>
                <a href="#products-catalog" className="hover:text-white transition">
                  {isArabic ? 'البناطيل والسويت بانتس' : 'Pants & Sweatpants'}
                </a>
              </li>
              <li>
                <a href="#products-catalog" className="hover:text-white transition">
                  {isArabic ? 'الشورتات الكاجوال والقطنية' : 'Shorts Collection'}
                </a>
              </li>
              <li>
                <a href="#products-catalog" className="hover:text-white transition">
                  {isArabic ? 'الأطقم والتنسيقات الكاملة' : 'Outfit Sets & Combos'}
                </a>
              </li>
              <li>
                <a href="#products-catalog" className="hover:text-white transition">
                  {isArabic ? 'الملابس الضاغطة ستيلث' : 'Stealth Compressions'}
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care & Direct Service */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="font-black uppercase tracking-wider text-white">
              {isArabic ? 'خدمات العملاء' : 'Customer Care'}
            </h4>
            <ul className="space-y-2 text-neutral-400 font-medium">
              {onOpenProfile && (
                <li>
                  <button onClick={onOpenProfile} className="hover:text-white transition text-left rtl:text-right cursor-pointer">
                    {isArabic ? '👤 بيانات العميل وسجل طلباتي' : '👤 Customer Profile & My Orders'}
                  </button>
                </li>
              )}
              <li>
                <button onClick={onOpenOrderTracking} className="hover:text-white transition text-left rtl:text-right cursor-pointer">
                  {isArabic ? '📦 تتبع الشحنة برقم الطلب' : '📦 Track Package by Order #'}
                </button>
              </li>
            </ul>

            <div className="pt-3">
              <span className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                {isArabic ? 'طرق الدفع المتاحة' : 'Payment Methods'}
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-neutral-300">
                <span className="px-2.5 py-1 bg-neutral-900 rounded border border-neutral-800">فودافون كاش</span>
                <span className="px-2.5 py-1 bg-neutral-900 rounded border border-neutral-800">انستا باي INSTAPAY</span>
                <span className="px-2.5 py-1 bg-neutral-900 rounded border border-neutral-800">الدفع عند الاستلام</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
          <p>{isArabic ? footerSettings.copyrightTextAr : 'All rights reserved to SOTRA.'}</p>
        </div>
      </div>
    </footer>
  );
};

