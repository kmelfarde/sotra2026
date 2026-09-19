export interface ColorSizeStock {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | string;
  stockCount: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  borderHex?: string;
  images: string[];
  sizesStock?: ColorSizeStock[];
}

export interface ProductSize {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | string;
  inStock: boolean;
  stockCount: number;
}

export interface ProductPromoBanner {
  id: string;
  title: string;
  titleAr: string;
  subtitle?: string;
  subtitleAr?: string;
  badge?: string;
  badgeAr?: string;
  discountBadge?: string;
  discountBadgeAr?: string;
  image: string;
  // targetType: 'bundle' -> opens outfit bundle customizer (choose sizes & add to cart)
  // 'product' -> opens another specific product
  // 'category' -> navigates to a category page
  // 'link' -> external or special URL
  targetType: 'bundle' | 'product' | 'category' | 'link';
  targetId?: string; // bundle ID or product ID or category ID
  targetUrl?: string;
  buttonText?: string;
  buttonTextAr?: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  fit?: string;
  fitAr?: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent?: number;
  badge?: 'RESTOCKED' | 'NEW' | 'BESTSELLER' | 'HOT' | string;
  rating: number;
  reviewCount: number;
  colors: ProductColor[];
  sizes: ProductSize[];
  description: string;
  descriptionAr?: string;
  fabric: string;
  fabricAr?: string;
  modelInfo: string;
  modelInfoAr?: string;
  features: string[];
  featuresAr?: string[];
  careInstructions: string[];
  promoBanner?: ProductPromoBanner;
  // Complementary item ("قطعة مكملة للإطلالة")
  complementaryProductId?: string;
  complementaryDiscountPercent?: number;
  // Integrated outfit coordinates ("تنسيقة الإطلالة المتكاملة")
  coordinatedOutfitIds?: string[];
  // Display ordering priority
  displayOrder?: number;
  inStock?: boolean;
  isNewArrival?: boolean;
}

export interface StoreCategory {
  id: string;
  name: string;
  nameAr: string;
  image: string;
  count?: number;
  showInShopByCategory?: boolean;
}

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  nameAr?: string;
  fit?: string;
  fitAr?: string;
  colorName: string;
  colorHex: string;
  size: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
}

export type CurrencyCode = 'EGP' | 'USD' | 'SAR' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // relative to EGP
  prefix: string;
}

export type CategoryTab = 'all' | 'sets' | 'tops' | 'compressions' | 'tanks' | 'bottoms' | 'accessories';

export interface BundleItemConfig {
  productId: string;
  defaultSize?: string;
  defaultColorId?: string;
  selectedColorId: string;
  selectedSize: string;
}

export interface OutfitBundle {
  id: string;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  description: string;
  descriptionAr: string;
  image: string; // High quality showcase outfit image
  galleryImages: string[];
  productIds: string[]; // List of product IDs included in the set
  originalPrice: number; // Sum of individual prices
  bundlePrice: number; // Discounted bundle price
  discountPercent: number;
  badge?: 'BEST VALUE' | 'LIMITED SET' | 'HOT BUNDLE' | 'MOST POPULAR';
  badgeAr?: string;
}

export interface CartBundleItem {
  cartId: string;
  bundleId: string;
  name: string;
  nameAr?: string;
  bundleImage: string;
  price: number;
  originalPrice: number;
  quantity: number;
  items: {
    productId: string;
    productName: string;
    productNameAr?: string;
    colorName: string;
    colorHex: string;
    size: string;
    image: string;
  }[];
}

export interface FilterOptions {
  category: CategoryTab;
  fit?: string[];
  colors: string[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'discount' | 'newest';
  searchQuery: string;
  onlyInStock: boolean;
  onlyDiscounted: boolean;
}

export interface CustomerProfile {
  name: string;
  phone: string;
  whatsapp: string;
  governorate: string;
  address: string;
}

export type OrderStatusType =
  | 'received'          // تم استلام الطلب
  | 'shipping_paid'     // تاكيد دفع الشحن
  | 'courier'           // الطلب بشركة الشحن
  | 'delivered'         // تم التوصيل
  | 'cancelled';        // ملغي

export interface CustomerOrder {
  orderId: string;
  date: string;
  items: CartItem[];
  customer: CustomerProfile;
  paymentMethod: 'vodafone_cash' | 'instapay' | 'cod' | 'orange_cash' | 'etisalat_cash' | string;
  senderPhone?: string;
  transactionRef?: string;
  shippingFee: number;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatusType | string;
  statusAr: string;
  stockDeducted?: boolean; // whether stock was decremented for this order
  deliveredAt?: string;    // timestamp when delivered
  cancelledAt?: string;    // timestamp when cancelled
  notes?: string;
  acknowledged?: boolean;  // whether admin has clicked "seen" / "رأيته"
}

export interface WalletSettings {
  vodafoneCash: string;
  instapay?: string;
  instapayHandle: string;
  instapayPhone: string;
  orangeCash: string;
  etisalatCash: string;
  requireShippingPayment: boolean; // إرسال رسوم الشحن إجباري
  // Payment methods toggles
  enableVodafoneCash?: boolean;
  enableInstapay?: boolean;
  enableCod?: boolean;
  enableOrangeCash?: boolean;
  enableEtisalatCash?: boolean;
}

export interface GovernorateRate {
  id: string;
  nameEn: string;
  nameAr: string;
  fee: number;
}

export interface FooterSettings {
  aboutTextAr: string;
  aboutTextEn: string;
  pillar1TitleAr: string;
  pillar1TitleEn?: string;
  pillar1DescAr: string;
  pillar1DescEn?: string;
  pillar2TitleAr: string;
  pillar2TitleEn?: string;
  pillar2DescAr: string;
  pillar2DescEn?: string;
  pillar3TitleAr: string;
  pillar3TitleEn?: string;
  pillar3DescAr: string;
  pillar3DescEn?: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  copyrightTextAr: string;
  customerServiceNoteAr: string;
}

export interface SupportSettings {
  whatsappPhone: string; // e.g. 201068989523
  whatsappDisplay: string; // e.g. +20 10 68989523
}

export interface BroadcastNotification {
  enabled: boolean;
  message: string;
  messageEn?: string;
  type?: 'info' | 'alert' | 'urgent';
  createdAt?: string;
}

export interface SitePromoPopup {
  enabled: boolean;
  imageUrl: string;
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  buttonTextAr?: string;
  buttonTextEn?: string;
  targetType: 'none' | 'product' | 'category';
  targetId?: string; // productId or categoryId
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customWidth?: number;
}

export type AdminRole = 'admin' | 'orders' | 'management' | 'data_entry';

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: AdminRole;
  nameAr: string;
  nameEn: string;
}

export interface UserReview {
  id: string;
  author: string;
  verified: boolean;
  rating: number;
  date: string;
  sizeBought: string;
  colorBought: string;
  title: string;
  comment: string;
  helpfulCount: number;
}
