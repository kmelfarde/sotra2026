import { Product, UserReview, StoreCategory } from '../types';

const RAW_PRODUCTS: Product[] = [];

export const CATEGORIES_DATA: StoreCategory[] = [
  {
    id: 'all',
    name: 'All Products',
    nameAr: 'كل المنتجات',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    count: 0
  },
  {
    id: 'tops',
    name: 'Tshirts & Tops',
    nameAr: 'تيشيرتات وتوبات',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    count: 0
  },
  {
    id: 'compressions',
    name: 'Compressions',
    nameAr: 'ملابس ضاغطة',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop',
    count: 0
  },
  {
    id: 'tanks',
    name: 'Tanks & Sleeveless',
    nameAr: 'ملابس كت وتانك',
    image: 'https://images.unsplash.com/photo-1584865288642-42078afe6942?q=80&w=800&auto=format&fit=crop',
    count: 0
  },
  {
    id: 'bottoms',
    name: 'Pants & Shorts',
    nameAr: 'بناطيل وشورتات كاجوال',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format&fit=crop',
    count: 0
  },
  {
    id: 'accessories',
    name: 'Bags & Accessories',
    nameAr: 'حقائب واكسسوارات',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    count: 0
  }
];

export const CUSTOMER_REVIEWS: UserReview[] = [];

export const PRODUCT_PROMO_BANNERS: Record<string, import('../types').ProductPromoBanner> = {};

export const FEATURED_PROMO_BANNERS: import('../types').ProductPromoBanner[] = [];

export const PRODUCTS: Product[] = [];

export const INITIAL_PRODUCTS = PRODUCTS;

export const CURRENCY_RATES: Record<string, number> = {
  EGP: 1,
  USD: 0.02,
  SAR: 0.075,
  AED: 0.073
};

export interface GovernorateShipping {
  id: string;
  nameEn: string;
  nameAr: string;
  fee: number;
}

export const EGYPT_GOVERNORATES_SHIPPING: GovernorateShipping[] = [
  { id: 'cairo', nameEn: 'Cairo', nameAr: 'القاهرة', fee: 45 },
  { id: 'giza', nameEn: 'Giza', nameAr: 'الجيزة', fee: 45 },
  { id: 'alex', nameEn: 'Alexandria', nameAr: 'الإسكندرية', fee: 55 },
  { id: 'qalyubia', nameEn: 'Qalyubia', nameAr: 'القليوبية', fee: 50 },
  { id: 'dakahlia', nameEn: 'Dakahlia / Mansoura', nameAr: 'الدقهلية / المنصورة', fee: 55 },
  { id: 'gharbia', nameEn: 'Gharbia / Tanta', nameAr: 'الغربية / طنطا', fee: 55 },
  { id: 'sharqia', nameEn: 'Sharqia / Zagazig', nameAr: 'الشرقية / الزقازيق', fee: 55 },
  { id: 'monufia', nameEn: 'Monufia', nameAr: 'المنوفية', fee: 55 },
  { id: 'beheira', nameEn: 'Beheira', nameAr: 'البحيرة', fee: 55 },
  { id: 'damietta', nameEn: 'Damietta', nameAr: 'دمياط', fee: 55 },
  { id: 'portsaid', nameEn: 'Port Said', nameAr: 'بورسعيد', fee: 55 },
  { id: 'ismailia', nameEn: 'Ismailia', nameAr: 'الإسماعيلية', fee: 55 },
  { id: 'suez', nameEn: 'Suez', nameAr: 'السويس', fee: 55 },
  { id: 'fayoum', nameEn: 'Fayoum', nameAr: 'الفيوم', fee: 65 },
  { id: 'benisuef', nameEn: 'Beni Suef', nameAr: 'بني سويف', fee: 65 },
  { id: 'minya', nameEn: 'Minya', nameAr: 'المنيا', fee: 70 },
  { id: 'asyut', nameEn: 'Asyut', nameAr: 'أسيوط', fee: 70 },
  { id: 'sohag', nameEn: 'Sohag', nameAr: 'سوهاج', fee: 75 },
  { id: 'qena', nameEn: 'Qena', nameAr: 'قنا', fee: 75 },
  { id: 'luxor', nameEn: 'Luxor', nameAr: 'الأقصر', fee: 80 },
  { id: 'aswan', nameEn: 'Aswan', nameAr: 'أسوان', fee: 80 },
  { id: 'redsea', nameEn: 'Red Sea / Hurghada', nameAr: 'البحر الأحمر / الغردقة', fee: 85 },
  { id: 'southsinai', nameEn: 'South Sinai / Sharm El Sheikh', nameAr: 'جنوب سيناء / شرم الشيخ', fee: 85 },
  { id: 'matrouh', nameEn: 'Matrouh / North Coast', nameAr: 'مطروح / الساحل الشمالي', fee: 80 }
];

export const EGYPT_GOVERNORATES = EGYPT_GOVERNORATES_SHIPPING.map(
  (g) => `${g.nameEn} (${g.nameAr})`
);
