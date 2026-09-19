import {
  FooterSettings,
  SupportSettings,
  WalletSettings,
  GovernorateRate,
  BroadcastNotification,
  SitePromoPopup
} from '../types';

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  aboutTextAr: 'سوترا هي علامة تجارية مصرية رائدة في الأزياء الرجالية الرياضية والكاجوال العصرية، نجمع بين أعلى معايير الجودة والأقمشة المتطورة بتصاميم استثنائية.',
  aboutTextEn: 'SOTRA is a premier Egyptian menswear brand blending modern athletic craftsmanship, premium fabrics, and sleek urban aesthetics.',
  pillar1TitleAr: 'شحن سريع وموثوق',
  pillar1TitleEn: 'Fast & Secure Shipping',
  pillar1DescAr: 'توصيل لباب بيتك في جميع محافظات مصر بأسعار شحن تنافسية.',
  pillar1DescEn: 'Door-to-door nationwide delivery across all governorates.',
  pillar2TitleAr: 'جودة وخامات ممتازة',
  pillar2TitleEn: 'Premium Fabrics',
  pillar2DescAr: 'أقمشة قطنية وتقنية معالجة لتدوم طويلاً وتمنحك أقصى راحة.',
  pillar2DescEn: 'Durable, breathable technical & cotton fabrics designed for comfort.',
  pillar3TitleAr: 'دعم فني واستبدال سهل',
  pillar3TitleEn: 'Dedicated Support',
  pillar3DescAr: 'خدمة عملاء متاحة عبر واتساب لمساعدتك في المقاسات والاستبدال.',
  pillar3DescEn: 'Friendly customer service ready on WhatsApp for sizing & exchange.',
  instagramUrl: 'https://instagram.com/sotra_eg',
  tiktokUrl: 'https://tiktok.com/@sotra_eg',
  facebookUrl: 'https://facebook.com/sotra.eg',
  copyrightTextAr: '© 2026 سوترا للأزياء الرجالية. جميع الحقوق محفوظة.',
  customerServiceNoteAr: 'خدمة العملاء متوفرة يومياً من 10 صباحاً حتى 11 مساءً'
};

export const DEFAULT_SUPPORT_SETTINGS: SupportSettings = {
  whatsappPhone: '201068989523',
  whatsappDisplay: '+20 106 898 9523'
};

export const DEFAULT_WALLET_SETTINGS: WalletSettings = {
  vodafoneCash: '01068989523',
  instapay: 'sotra@instapay',
  instapayHandle: 'sotra@instapay',
  instapayPhone: '01068989523',
  orangeCash: '01200000000',
  etisalatCash: '01100000000',
  requireShippingPayment: true,
  enableVodafoneCash: true,
  enableInstapay: true,
  enableCod: true,
  enableOrangeCash: false,
  enableEtisalatCash: false
};

export const DEFAULT_GOVERNORATES_RATES: GovernorateRate[] = [
  { id: 'cairo', nameEn: 'Cairo', nameAr: 'القاهرة', fee: 50 },
  { id: 'giza', nameEn: 'Giza', nameAr: 'الجيزة', fee: 50 },
  { id: 'alexandria', nameEn: 'Alexandria', nameAr: 'الإسكندرية', fee: 55 },
  { id: 'qalyubia', nameEn: 'Qalyubia', nameAr: 'القليوبية', fee: 60 },
  { id: 'sharqia', nameEn: 'Sharqia', nameAr: 'الشرقية', fee: 65 },
  { id: 'dakahlia', nameEn: 'Dakahlia', nameAr: 'الدقهلية', fee: 65 },
  { id: 'gharbia', nameEn: 'Gharbia', nameAr: 'الغربية', fee: 65 },
  { id: 'monufia', nameEn: 'Monufia', nameAr: 'المنوفية', fee: 65 },
  { id: 'beheira', nameEn: 'Beheira', nameAr: 'البحيرة', fee: 65 },
  { id: 'kafr_el_sheikh', nameEn: 'Kafr El Sheikh', nameAr: 'كفر الشيخ', fee: 70 },
  { id: 'damietta', nameEn: 'Damietta', nameAr: 'دمياط', fee: 70 },
  { id: 'port_said', nameEn: 'Port Said', nameAr: 'بورسعيد', fee: 70 },
  { id: 'ismailia', nameEn: 'Ismailia', nameAr: 'الإسماعيلية', fee: 70 },
  { id: 'suez', nameEn: 'Suez', nameAr: 'السويس', fee: 70 },
  { id: 'fayoum', nameEn: 'Fayoum', nameAr: 'الفيوم', fee: 75 },
  { id: 'beni_suef', nameEn: 'Beni Suef', nameAr: 'بني سويف', fee: 75 },
  { id: 'minya', nameEn: 'Minya', nameAr: 'المنيا', fee: 80 },
  { id: 'assiut', nameEn: 'Assiut', nameAr: 'أسيوط', fee: 85 },
  { id: 'sohag', nameEn: 'Sohag', nameAr: 'سوهاج', fee: 90 },
  { id: 'qena', nameEn: 'Qena', nameAr: 'قنا', fee: 95 },
  { id: 'luxor', nameEn: 'Luxor', nameAr: 'الأقصر', fee: 100 },
  { id: 'aswan', nameEn: 'Aswan', nameAr: 'أسوان', fee: 110 },
  { id: 'red_sea', nameEn: 'Red Sea', nameAr: 'البحر الأحمر والغردقة', fee: 100 },
  { id: 'matrouh', nameEn: 'Matrouh', nameAr: 'مطروح والساحل', fee: 100 },
  { id: 'south_sinai', nameEn: 'South Sinai', nameAr: 'جنوب سيناء وشرم الشيخ', fee: 110 }
];

export const DEFAULT_BROADCAST_NOTIFICATION: BroadcastNotification = {
  enabled: false,
  message: '🔥 شحن مجاني لكافة محافظات مصر عند الطلب بأكثر من 1500 جنيه!',
  messageEn: '🔥 Free nationwide shipping on orders over 1500 EGP!',
  type: 'info'
};

export const DEFAULT_PROMO_POPUP: SitePromoPopup = {
  enabled: false,
  imageUrl: '',
  titleAr: 'عرض خاص لفترة محدودة',
  titleEn: 'Limited Time Special Offer',
  subtitleAr: 'استمتع بخصم إضافي 10% عند استخدام كود SOTRA10',
  subtitleEn: 'Enjoy 10% off with promo code SOTRA10',
  buttonTextAr: 'تسوق الآن',
  buttonTextEn: 'Shop Now',
  targetType: 'none',
  size: 'md'
};

const STORAGE_KEY_PREFIX = 'sotra_setting_';

function getLocalSetting<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    if (raw) {
      return { ...defaultValue, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn(`Error reading setting ${key}:`, err);
  }
  return defaultValue;
}

export function saveLocalSetting<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('sotra_settings_updated', { detail: { key, value } }));
  } catch (err) {
    console.warn(`Error saving setting ${key}:`, err);
  }
}

export function getFooterSettings(): FooterSettings {
  return getLocalSetting('footer', DEFAULT_FOOTER_SETTINGS);
}

export function getSupportSettings(): SupportSettings {
  return getLocalSetting('support', DEFAULT_SUPPORT_SETTINGS);
}

export function getWalletSettings(): WalletSettings {
  return getLocalSetting('wallet', DEFAULT_WALLET_SETTINGS);
}

export function getGovernoratesRates(): GovernorateRate[] {
  if (typeof window === 'undefined') return DEFAULT_GOVERNORATES_RATES;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}governorates`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading governorates rates:', err);
  }
  return DEFAULT_GOVERNORATES_RATES;
}

export function getBroadcastNotification(): BroadcastNotification {
  return getLocalSetting('broadcast_notification', DEFAULT_BROADCAST_NOTIFICATION);
}

export function getPromoPopupSettings(): SitePromoPopup {
  return getLocalSetting('site_promo_popup', DEFAULT_PROMO_POPUP);
}
