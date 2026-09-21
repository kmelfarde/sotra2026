import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Check,
  Package,
  Layers,
  Link as LinkIcon,
  RefreshCw,
  LogOut,
  Image as ImageIcon,
  Save,
  Search,
  CheckCircle2,
  Sliders,
  DollarSign,
  ShoppingCart,
  Users,
  Settings as SettingsIcon,
  Database,
  Shield,
  Sparkles,
  Upload
} from 'lucide-react';
import {
  Product,
  StoreCategory,
  OutfitBundle,
  ProductColor,
  ProductSize,
  CustomerOrder,
  OrderStatusType,
  StoreNotification,
  SitePromoPopup,
  HeroBannerSettings,
  TopAnnouncementSettings,
  FreeShippingSettings,
  PromoCode
} from '../types';
import { AdminOrdersTab } from './admin/AdminOrdersTab';
import { AdminCustomersTab } from './admin/AdminCustomersTab';
import { AdminSettingsTab } from './admin/AdminSettingsTab';
import { AdminBackupTab } from './admin/AdminBackupTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminMarketingTab } from './admin/AdminMarketingTab';
import { getCurrentAdminUser, getAllowedTabsForRole } from '../utils/adminAuth';
import {
  deleteProductFromFirestore,
  deleteCategoryFromFirestore,
  deleteBundleFromFirestore,
  saveProductToFirestore,
  saveCategoryToFirestore,
  saveBundleToFirestore
} from '../firebase/db';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  products: Product[];
  onSaveProducts: (products: Product[]) => void;
  categories: StoreCategory[];
  onSaveCategories: (categories: StoreCategory[]) => void;
  bundles: OutfitBundle[];
  onSaveBundles: (bundles: OutfitBundle[]) => void;
  orders?: CustomerOrder[];
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatusType) => void;
  onUpdateOrders?: (orders: CustomerOrder[]) => void;
  marketingSettings?: {
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
  };
  onResetDefaults: () => void;
  isArabic: boolean;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  products,
  onSaveProducts,
  categories,
  onSaveCategories,
  bundles,
  onSaveBundles,
  orders = [],
  onUpdateOrderStatus,
  onUpdateOrders,
  marketingSettings,
  onResetDefaults,
  isArabic
}) => {
  const currentUser = getCurrentAdminUser();
  const allowedTabs = getAllowedTabsForRole(currentUser?.role || 'admin');

  const [activeTab, setActiveTab] = useState<
    'products' | 'categories' | 'marketing' | 'look_coordination' | 'bundles' | 'orders' | 'customers' | 'settings' | 'backup' | 'users'
  >(() => {
    const tabs = getAllowedTabsForRole(currentUser?.role || 'admin');
    return (tabs[0] as any) || 'products';
  });

  // Keep activeTab synchronized with permissions
  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab((allowedTabs[0] as any) || 'products');
    }
  }, [currentUser?.role, allowedTabs, activeTab]);

  // Search & Filter state for products tab
  const [productSearch, setProductSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');

  // Product Edit/Create Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Category Edit/Create State
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Bundle Edit/Create State
  const [editingBundle, setEditingBundle] = useState<OutfitBundle | null>(null);
  const [isCreatingBundle, setIsCreatingBundle] = useState(false);
  const [bundleSearchQuery, setBundleSearchQuery] = useState('');

  // Outfit Images State
  const [productOutfitUrlInput, setProductOutfitUrlInput] = useState('');
  const [coordinationOutfitUrlInputs, setCoordinationOutfitUrlInputs] = useState<Record<string, string>>({});

  // Feedback banner
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // PRODUCT REORDERING (Position Control)
  const moveProduct = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newProducts = [...products];
    const temp = newProducts[index];
    newProducts[index] = newProducts[targetIndex];
    newProducts[targetIndex] = temp;

    // Update displayOrder
    newProducts.forEach((p, idx) => {
      p.displayOrder = idx;
    });

    onSaveProducts(newProducts);
    showNotification(isArabic ? 'تم تحديث موضع المنتج بنجاح' : 'Product position updated');
  };

  // PRODUCT DELETE
  const handleDeleteProduct = (id: string) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
      const updated = products.filter((p) => p.id !== id);
      onSaveProducts(updated);
      deleteProductFromFirestore(id).catch(console.error);
      showNotification(isArabic ? 'تم حذف المنتج' : 'Product deleted');
    }
  };

  // PRODUCT SAVE (Edit or Create)
  const handleSaveProduct = (prod: Product) => {
    let updated: Product[];
    if (isCreatingProduct) {
      updated = [prod, ...products];
    } else {
      updated = products.map((p) => (p.id === prod.id ? prod : p));
    }
    onSaveProducts(updated);
    saveProductToFirestore(prod).catch(console.error);
    setEditingProduct(null);
    setIsCreatingProduct(false);
    showNotification(isArabic ? 'تم حفظ المنتج بنجاح' : 'Product saved successfully');
  };

  // CATEGORY SAVE
  const handleSaveCategory = (cat: StoreCategory) => {
    let updated: StoreCategory[];
    if (isCreatingCategory) {
      updated = [...categories, cat];
    } else {
      updated = categories.map((c) => (c.id === cat.id ? cat : c));
    }
    onSaveCategories(updated);
    saveCategoryToFirestore(cat).catch(console.error);
    setEditingCategory(null);
    setIsCreatingCategory(false);
    showNotification(isArabic ? 'تم حفظ بيانات القسم' : 'Category saved');
  };

  // CATEGORY DELETE
  const handleDeleteCategory = (catId: string) => {
    if (catId === 'all') {
      alert(isArabic ? 'لا يمكن حذف قسم كل المنتجات' : 'Cannot delete default category');
      return;
    }
    if (window.confirm(isArabic ? 'هل تريد بالتأكيد حذف هذا القسم؟' : 'Delete this category?')) {
      const updated = categories.filter((c) => c.id !== catId);
      onSaveCategories(updated);
      deleteCategoryFromFirestore(catId).catch(console.error);
      showNotification(isArabic ? 'تم حذف القسم' : 'Category deleted');
    }
  };

  // CATEGORY SHOP BY CATEGORY TOGGLE
  const toggleShopByCategory = (catId: string) => {
    const updated = categories.map((c) => {
      if (c.id === catId) {
        const toggled = { ...c, showInShopByCategory: !c.showInShopByCategory };
        saveCategoryToFirestore(toggled).catch(console.error);
        return toggled;
      }
      return c;
    });
    onSaveCategories(updated);
    showNotification(isArabic ? 'تم تحديث الأقسام المعروضة في الرئيسية' : 'Shop by Category updated');
  };

  // BUNDLE SAVE
  const handleSaveBundle = (bundle: OutfitBundle) => {
    let updated: OutfitBundle[];
    if (isCreatingBundle) {
      updated = [bundle, ...bundles];
    } else {
      updated = bundles.map((b) => (b.id === bundle.id ? bundle : b));
    }
    onSaveBundles(updated);
    saveBundleToFirestore(bundle).catch(console.error);
    setEditingBundle(null);
    setIsCreatingBundle(false);
    showNotification(isArabic ? 'تم حفظ الطقم والتنسيقة الكاملة' : 'Bundle saved successfully');
  };

  // BUNDLE DELETE
  const handleDeleteBundle = (bundleId: string) => {
    if (window.confirm(isArabic ? 'هل تريد حذف هذا الطقم؟' : 'Delete this bundle?')) {
      const updated = bundles.filter((b) => b.id !== bundleId);
      onSaveBundles(updated);
      deleteBundleFromFirestore(bundleId).catch(console.error);
      showNotification(isArabic ? 'تم حذف الطقم' : 'Bundle deleted');
    }
  };

  // Filtered Products for List
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      productSearch === '' ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.nameAr && p.nameAr.includes(productSearch)) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = selectedCatFilter === 'all' || p.category === selectedCatFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[94vh] bg-white text-neutral-900 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200">
        {/* Top Bar */}
        <div className="p-3 sm:p-4 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="font-stencil font-black text-lg sm:text-xl tracking-[0.25em] uppercase text-white">
              SOTRA
            </span>
            {currentUser && (
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                <span className="text-xs text-neutral-300 font-medium hidden sm:inline">
                  {isArabic ? currentUser.nameAr : currentUser.nameEn}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 rounded uppercase">
                  {currentUser.role}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-bold text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تسجيل خروج' : 'Logout'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {notification && (
          <div className="bg-green-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shrink-0 animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <CheckCircle2 className="w-4 h-4" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs (Filtered by Role Permissions) */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 overflow-x-auto no-scrollbar shrink-0 text-xs font-bold">
          {allowedTabs.includes('products') && (
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 rtl:space-x-reverse whitespace-nowrap transition cursor-pointer ${
                activeTab === 'products'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{isArabic ? `المنتجات والترتيب (${products.length})` : `Products & Order (${products.length})`}</span>
            </button>
          )}

          {allowedTabs.includes('categories') && (
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 rtl:space-x-reverse whitespace-nowrap transition cursor-pointer ${
                activeTab === 'categories'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{isArabic ? `الأقسام (${categories.length})` : `Categories (${categories.length})`}</span>
            </button>
          )}

          {allowedTabs.includes('marketing') && (
            <button
              type="button"
              onClick={() => setActiveTab('marketing')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 rtl:space-x-reverse whitespace-nowrap transition cursor-pointer ${
                activeTab === 'marketing'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isArabic ? 'الإعلانات والخصومات والتسويق' : 'Marketing & Alerts'}</span>
            </button>
          )}

          {allowedTabs.includes('look_coordination') && (
            <button
              type="button"
              onClick={() => setActiveTab('look_coordination')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 rtl:space-x-reverse whitespace-nowrap transition cursor-pointer ${
                activeTab === 'look_coordination'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>{isArabic ? 'القطع المكملة للإطلالة' : 'Complementary Items'}</span>
            </button>
          )}

          {allowedTabs.includes('bundles') && (
            <button
              type="button"
              onClick={() => setActiveTab('bundles')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 rtl:space-x-reverse whitespace-nowrap transition cursor-pointer ${
                activeTab === 'bundles'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{isArabic ? `الأطقم والتنسيقات (${bundles.length})` : `Outfit Sets (${bundles.length})`}</span>
            </button>
          )}

          {allowedTabs.includes('orders') && (
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 rtl:space-x-reverse whitespace-nowrap transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isArabic ? `الطلبات والشحن (${orders.length})` : `Orders (${orders.length})`}</span>
            </button>
          )}

          {allowedTabs.includes('customers') && (
            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 rtl:space-x-reverse whitespace-nowrap transition cursor-pointer ${
                activeTab === 'customers'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{isArabic ? 'سجل العملاء' : 'Customers'}</span>
            </button>
          )}

          {allowedTabs.includes('settings') && (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 rtl:space-x-reverse whitespace-nowrap transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>{isArabic ? 'إعدادات المتجر والدفع' : 'Store Settings'}</span>
            </button>
          )}

          {allowedTabs.includes('backup') && (
            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 rtl:space-x-reverse whitespace-nowrap transition cursor-pointer ${
                activeTab === 'backup'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>{isArabic ? 'النسخ الاحتياطي والحذف' : 'Backup & Data'}</span>
            </button>
          )}

          {allowedTabs.includes('users') && (
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 rtl:space-x-reverse whitespace-nowrap transition cursor-pointer ${
                activeTab === 'users'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{isArabic ? 'الصلاحيات والمستخدمين' : 'Roles & Logins'}</span>
            </button>
          )}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-100/60">
          {/* TAB 1: PRODUCTS & PLACEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-neutral-200">
                <div className="flex flex-1 items-center space-x-2 rtl:space-x-reverse">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder={isArabic ? 'بحث بالاسم أو الكود...' : 'Search products by name/ID...'}
                      className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                  <select
                    value={selectedCatFilter}
                    onChange={(e) => setSelectedCatFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold text-neutral-700 cursor-pointer"
                  >
                    <option value="all">{isArabic ? 'جميع الأقسام' : 'All Categories'}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isArabic ? c.nameAr : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct({
                      id: `sotra-${Date.now().toString(36)}`,
                      name: '',
                      nameAr: '',
                      category: categories[0]?.id || 'tops',
                      fit: 'Athletic Fit',
                      fitAr: 'قصة رياضية مريحة',
                      originalPrice: 850,
                      discountedPrice: 650,
                      discountPercent: 23,
                      rating: 4.8,
                      reviewCount: 12,
                      description: 'Premium everyday apparel crafted for comfort and style.',
                      descriptionAr: 'خامة قطنية فاخرة توفر راحة تامة ومظهراً عصرياً جذاباً.',
                      fabric: '100% Combed Cotton',
                      fabricAr: 'قطن مصري 100% ناعم وعالي الكثافة',
                      modelInfo: 'Model is 182cm wearing size L',
                      modelInfoAr: 'طول الموديل 182 سم يرتدي مقاس L',
                      features: ['High durability fabric', 'Modern silhouette', 'Soft touch'],
                      featuresAr: ['خامات عالية التحمل', 'قصة عصرية متناسقة', 'ملمس فائق النعومة'],
                      careInstructions: ['Machine wash cold 30°C', 'Hang dry'],
                      colors: [
                        {
                          id: 'c-black',
                          name: 'Jet Black',
                          hex: '#111827',
                          images: [
                            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop'
                          ]
                        }
                      ],
                      sizes: [
                        { size: 'S', inStock: true, stockCount: 15 },
                        { size: 'M', inStock: true, stockCount: 25 },
                        { size: 'L', inStock: true, stockCount: 30 },
                        { size: 'XL', inStock: true, stockCount: 20 },
                        { size: 'XXL', inStock: true, stockCount: 10 }
                      ],
                      displayOrder: 0
                    });
                    setIsCreatingProduct(true);
                  }}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider rounded flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isArabic ? 'إضافة منتج جديد' : 'Add New Product'}</span>
                </button>
              </div>

              {/* Products List & Table */}
              <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left rtl:text-right text-xs">
                    <thead className="bg-neutral-950 text-white uppercase text-[10px] font-black tracking-wider">
                      <tr>
                        <th className="py-3 px-3 w-16 text-center">{isArabic ? 'الترتيب' : 'Order'}</th>
                        <th className="py-3 px-3">{isArabic ? 'المنتج' : 'Product'}</th>
                        <th className="py-3 px-3">{isArabic ? 'القسم' : 'Category'}</th>
                        <th className="py-3 px-3">{isArabic ? 'السعر' : 'Price'}</th>
                        <th className="py-3 px-3">{isArabic ? 'الألوان' : 'Colors'}</th>
                        <th className="py-3 px-3">{isArabic ? 'المقاسات والمخزون' : 'Stock & Sizes'}</th>
                        <th className="py-3 px-3 text-center">{isArabic ? 'الظهور بالرئيسية' : 'Homepage Display'}</th>
                        <th className="py-3 px-3 text-center">{isArabic ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {filteredProducts.map((prod, idx) => {
                        const totalStock = prod.sizes.reduce((sum, s) => sum + (s.stockCount || 0), 0);
                        const mainImage = prod.colors[0]?.images[0] || '';

                        return (
                          <tr key={prod.id} className="hover:bg-neutral-50 transition">
                            {/* Position Controls */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex flex-col items-center space-y-1">
                                <button
                                  type="button"
                                  onClick={() => moveProduct(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 hover:bg-neutral-200 rounded disabled:opacity-20 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-[10px] font-bold text-neutral-500">#{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => moveProduct(idx, 'down')}
                                  disabled={idx === products.length - 1}
                                  className="p-1 hover:bg-neutral-200 rounded disabled:opacity-20 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                            {/* Product Info */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                <img
                                  src={mainImage}
                                  alt={prod.name}
                                  className="w-12 h-14 object-cover rounded bg-neutral-100 shrink-0 border border-neutral-200"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-neutral-900 text-xs truncate max-w-xs">
                                    {isArabic ? prod.nameAr || prod.name : prod.name}
                                  </div>
                                  <span className="text-[10px] text-neutral-400 font-mono block">
                                    {prod.id}
                                  </span>
                                  {prod.badge && (
                                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-red-100 text-red-700 text-[9px] font-black rounded">
                                      {prod.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[11px] font-bold">
                                {prod.category}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-black">
                                {prod.discountedPrice} LE
                              </div>
                              {prod.originalPrice > prod.discountedPrice && (
                                <div className="text-[10px] text-neutral-400 line-through">
                                  {prod.originalPrice} LE
                                </div>
                              )}
                            </td>

                            {/* Colors */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center -space-x-1 rtl:space-x-reverse">
                                {prod.colors.map((c) => (
                                  <span
                                    key={c.id}
                                    className="w-4 h-4 rounded-full border border-white shadow-xs"
                                    style={{ backgroundColor: c.hex }}
                                    title={c.name}
                                  />
                                ))}
                                <span className="text-[10px] text-neutral-500 mr-2 rtl:mr-0 rtl:ml-2">
                                  ({prod.colors.length})
                                </span>
                              </div>
                            </td>

                            {/* Sizes & Stock */}
                            <td className="py-2.5 px-3">
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-black text-neutral-900">
                                  {isArabic ? `${totalStock} قطعة` : `${totalStock} in stock`}
                                </span>
                                <div className="flex flex-wrap gap-1 text-[9px]">
                                  {prod.sizes.map((s) => (
                                    <span
                                      key={s.size}
                                      className={`px-1 py-0.2 rounded font-mono ${
                                        s.inStock && s.stockCount > 0
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-700 line-through'
                                      }`}
                                    >
                                      {s.size}:{s.stockCount}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>

                            {/* Homepage Placement (وصل حديثاً / الأكثر مبيعاً) */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const toggled = { ...prod, showInNewArrivals: !prod.showInNewArrivals };
                                    handleSaveProduct(toggled);
                                  }}
                                  className={`px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                                    prod.showInNewArrivals
                                      ? 'bg-black text-white border-black shadow-xs'
                                      : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:border-neutral-400'
                                  }`}
                                  title={isArabic ? 'تبديل الظهور في وصل حديثاً' : 'Toggle New Arrivals'}
                                >
                                  {isArabic ? 'وصل حديثاً' : 'New'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const toggled = { ...prod, showInBestSellers: !prod.showInBestSellers };
                                    handleSaveProduct(toggled);
                                  }}
                                  className={`px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                                    prod.showInBestSellers
                                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                      : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:border-neutral-400'
                                  }`}
                                  title={isArabic ? 'تبديل الظهور في الأكثر مبيعاً' : 'Toggle Best Sellers'}
                                >
                                  {isArabic ? 'الأكثر مبيعاً' : 'Best'}
                                </button>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    setIsCreatingProduct(false);
                                  }}
                                  className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded transition cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORIES & SHOP BY CATEGORY */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-neutral-200">
                <div>
                  <h4 className="text-sm font-black uppercase text-neutral-900">
                    {isArabic ? 'إدارة الأقسام وتسوق حسب الأقسام' : 'Categories Management'}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {isArabic
                      ? 'حدد الأقسام التي تظهر في قسم "تسوق حسب الأقسام" بالصفحة الرئيسية واضف أقساماً جديدة.'
                      : 'Control which categories appear in "Shop by Category" on Home page and add new ones.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory({
                      id: `cat-${Date.now().toString(36)}`,
                      name: '',
                      nameAr: '',
                      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
                      showInShopByCategory: true
                    });
                    setIsCreatingCategory(true);
                  }}
                  className="px-3.5 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase rounded flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isArabic ? 'إضافة قسم جديد' : 'Add Category'}</span>
                </button>
              </div>

              {/* Category Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/9] bg-neutral-100">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 text-white">
                        <h4 className="text-sm font-black uppercase tracking-wider font-heading">
                          {isArabic ? cat.nameAr : cat.name}
                        </h4>
                        <span className="text-[10px] text-neutral-300 font-mono">
                          ID: {cat.id}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-3">
                      {cat.descriptionAr && (
                        <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed bg-neutral-50 p-2 rounded border border-neutral-100">
                          {cat.descriptionAr}
                        </p>
                      )}

                      {/* Shop By Category toggle */}
                      <label className="flex items-center justify-between p-2 bg-neutral-50 rounded border border-neutral-200 cursor-pointer">
                        <span className="text-xs font-bold text-neutral-800">
                          {isArabic ? 'عرض في "تسوق حسب الأقسام"' : 'Show in "Shop by Category"'}
                        </span>
                        <input
                          type="checkbox"
                          checked={cat.showInShopByCategory ?? (cat.id !== 'all' && cat.id !== 'sets')}
                          onChange={() => toggleShopByCategory(cat.id)}
                          className="w-4 h-4 accent-black cursor-pointer"
                        />
                      </label>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsCreatingCategory(false);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-neutral-700 hover:text-black hover:bg-neutral-100 rounded transition cursor-pointer flex items-center space-x-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'تعديل' : 'Edit'}</span>
                        </button>

                        {cat.id !== 'all' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="px-2.5 py-1 text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition cursor-pointer flex items-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'حذف' : 'Delete'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MARKETING, ALERTS & BANNERS */}
          {activeTab === 'marketing' && marketingSettings && (
            <AdminMarketingTab
              notifications={marketingSettings.notifications}
              onUpdateNotifications={marketingSettings.onUpdateNotifications}
              promoPopup={marketingSettings.promoPopup}
              onUpdatePromoPopup={marketingSettings.onUpdatePromoPopup}
              heroBanner={marketingSettings.heroBanner}
              onUpdateHeroBanner={marketingSettings.onUpdateHeroBanner}
              topAnnouncement={marketingSettings.topAnnouncement}
              onUpdateTopAnnouncement={marketingSettings.onUpdateTopAnnouncement}
              freeShipping={marketingSettings.freeShipping}
              onUpdateFreeShipping={marketingSettings.onUpdateFreeShipping}
              promoCodes={marketingSettings.promoCodes}
              onUpdatePromoCodes={marketingSettings.onUpdatePromoCodes}
              isArabic={isArabic}
              onNotify={(msg) => {
                setNotification(msg);
                setTimeout(() => setNotification(null), 3500);
              }}
            />
          )}

          {/* TAB 3: LOOK COORDINATION & COMPLEMENTARY PIECES */}
          {activeTab === 'look_coordination' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-neutral-200">
                <h4 className="text-sm font-black uppercase text-neutral-900">
                  {isArabic ? 'قسم إضافة قطعة مكملة للإطلالة وتنسيقة الإطلالة المتكاملة' : 'Complete Look & Complementary Items'}
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  {isArabic
                    ? 'اختر أي منتج وقم بربط "قطعة مكملة للإطلالة" الموصى بشرائها معه، أو حدد "تنسيقة الإطلالة المتكاملة" (طقم كامل معاً).'
                    : 'Link complementary cross-sell items and coordinate full outfit sets for each product.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((prod) => {
                  const compProduct = products.find((p) => p.id === prod.complementaryProductId);
                  const coordProducts = (prod.coordinatedOutfitIds || [])
                    .map((cid) => products.find((p) => p.id === cid))
                    .filter(Boolean) as Product[];

                  return (
                    <div
                      key={prod.id}
                      className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs space-y-3"
                    >
                      {/* Product Header */}
                      <div className="flex items-center space-x-3 rtl:space-x-reverse pb-3 border-b border-neutral-100">
                        <img
                          src={prod.colors[0]?.images[0] || ''}
                          alt={prod.name}
                          className="w-12 h-14 object-cover rounded bg-neutral-100 shrink-0 border border-neutral-200"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-neutral-900 truncate">
                            {isArabic ? prod.nameAr || prod.name : prod.name}
                          </h4>
                          <span className="text-[10px] text-neutral-500 block">
                            {prod.category} • {prod.discountedPrice} LE
                          </span>
                        </div>
                      </div>

                      {/* Complementary Item Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          {isArabic ? 'القطعة المكملة للإطلالة (Cross-sell):' : 'Complementary Piece:'}
                        </label>
                        <select
                          value={prod.complementaryProductId || ''}
                          onChange={(e) => {
                            const newCompId = e.target.value;
                            const updated = products.map((p) =>
                              p.id === prod.id ? { ...p, complementaryProductId: newCompId || undefined } : p
                            );
                            onSaveProducts(updated);
                            showNotification(isArabic ? 'تم تحديث القطعة المكملة' : 'Complementary piece updated');
                          }}
                          className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-medium cursor-pointer"
                        >
                          <option value="">{isArabic ? '-- بدون قطعة مكملة محددة --' : '-- No item selected --'}</option>
                          {products
                            .filter((p) => p.id !== prod.id)
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {isArabic ? p.nameAr || p.name : p.name} ({p.discountedPrice} LE)
                              </option>
                            ))}
                        </select>
                        {compProduct && (
                          <div className="mt-1.5 flex items-center space-x-2 rtl:space-x-reverse text-[10px] text-green-700 font-bold bg-green-50 p-1.5 rounded border border-green-200">
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {isArabic
                                ? `مربوط بـ: ${compProduct.nameAr || compProduct.name}`
                                : `Linked with: ${compProduct.name}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Coordinated Outfit Items */}
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          {isArabic ? 'تنسيقة الإطلالة المتكاملة (قطع الطقم):' : 'Coordinated Look Outfit Pieces:'}
                        </label>
                        <div className="space-y-1 max-h-32 overflow-y-auto border border-neutral-200 rounded p-2 bg-neutral-50 text-[11px]">
                          {products
                            .filter((p) => p.id !== prod.id)
                            .map((otherProd) => {
                              const isSelected = (prod.coordinatedOutfitIds || []).includes(otherProd.id);
                              return (
                                <label
                                  key={otherProd.id}
                                  className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer hover:bg-neutral-100 p-1 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const current = prod.coordinatedOutfitIds || [];
                                      const nextIds = e.target.checked
                                        ? [...current, otherProd.id]
                                        : current.filter((id) => id !== otherProd.id);
                                      const updated = products.map((p) =>
                                        p.id === prod.id ? { ...p, coordinatedOutfitIds: nextIds } : p
                                      );
                                      onSaveProducts(updated);
                                    }}
                                    className="w-3.5 h-3.5 accent-black cursor-pointer"
                                  />
                                  <span className="truncate">
                                    {isArabic ? otherProd.nameAr || otherProd.name : otherProd.name} (
                                    {otherProd.discountedPrice} LE)
                                  </span>
                                </label>
                              );
                            })}
                        </div>
                        {coordProducts.length > 0 && (
                          <div className="mt-1 text-[10px] text-neutral-500 font-semibold">
                            {isArabic
                              ? `تم اختيار ${coordProducts.length} قطع لتنسيقة الإطلالة الكاملة لهذا المنتج`
                              : `${coordProducts.length} coordinated pieces selected`}
                          </div>
                        )}
                      </div>

                      {/* Linked Outfit Photos ("صور أطقم مربوطة بها") */}
                      <div className="pt-2.5 border-t border-neutral-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-neutral-800 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-neutral-600" />
                            <span>{isArabic ? 'صور أطقم وإطلالات مربوطة بهذا المنتج:' : 'Linked Outfit / Look Photos:'}</span>
                          </label>
                          <span className="text-[10px] text-neutral-500">
                            {prod.outfitImages?.length || 0} {isArabic ? 'صور' : 'photos'}
                          </span>
                        </div>

                        {/* Thumbnails of current outfit images */}
                        {prod.outfitImages && prod.outfitImages.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-neutral-50 rounded border border-neutral-200">
                            {prod.outfitImages.map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="relative group w-14 h-16 rounded overflow-hidden border border-neutral-300 bg-white shrink-0">
                                <img src={imgUrl} alt={`Outfit ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextImages = prod.outfitImages!.filter((_, i) => i !== imgIdx);
                                    const updated = products.map((p) => (p.id === prod.id ? { ...p, outfitImages: nextImages } : p));
                                    onSaveProducts(updated);
                                    saveProductToFirestore({ ...prod, outfitImages: nextImages }).catch(console.error);
                                    showNotification(isArabic ? 'تم حذف صورة الطقم' : 'Outfit image removed');
                                  }}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                                  title="Remove image"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Outfit Image inputs: File Upload & URL */}
                        <div className="flex flex-col sm:flex-row gap-1.5 text-xs">
                          <div className="flex-1 flex gap-1">
                            <input
                              type="url"
                              placeholder={isArabic ? 'أدخل رابط صورة الطقم (URL)...' : 'Paste outfit image URL...'}
                              value={coordinationOutfitUrlInputs[prod.id] || ''}
                              onChange={(e) => setCoordinationOutfitUrlInputs({ ...coordinationOutfitUrlInputs, [prod.id]: e.target.value })}
                              className="flex-1 px-2 py-1 bg-neutral-50 border border-neutral-300 rounded text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const url = (coordinationOutfitUrlInputs[prod.id] || '').trim();
                                if (!url) return;
                                const current = prod.outfitImages || [];
                                const nextImages = [...current, url];
                                const updated = products.map((p) => (p.id === prod.id ? { ...p, outfitImages: nextImages } : p));
                                onSaveProducts(updated);
                                saveProductToFirestore({ ...prod, outfitImages: nextImages }).catch(console.error);
                                setCoordinationOutfitUrlInputs({ ...coordinationOutfitUrlInputs, [prod.id]: '' });
                                showNotification(isArabic ? 'تمت إضافة صورة الطقم بنجاح' : 'Outfit photo added');
                              }}
                              className="px-2.5 py-1 bg-black hover:bg-neutral-800 text-white text-[10px] font-bold rounded cursor-pointer"
                            >
                              {isArabic ? 'إضافة' : 'Add'}
                            </button>
                          </div>

                          <label className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded text-[10px] font-bold text-neutral-800 flex items-center justify-center gap-1 cursor-pointer transition">
                            <Upload className="w-3 h-3" />
                            <span>{isArabic ? 'رفع من الجهاز' : 'Upload File'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const result = reader.result as string;
                                    if (result) {
                                      const current = prod.outfitImages || [];
                                      const nextImages = [...current, result];
                                      const updated = products.map((p) => (p.id === prod.id ? { ...p, outfitImages: nextImages } : p));
                                      onSaveProducts(updated);
                                      saveProductToFirestore({ ...prod, outfitImages: nextImages }).catch(console.error);
                                      showNotification(isArabic ? 'تم رفع صورة الطقم وحفظها' : 'Outfit photo uploaded');
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: OUTFIT SETS & BUNDLES (قسم خاص لـ الأطقم والتنسيقات الكاملة) */}
          {activeTab === 'bundles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-neutral-200">
                <div>
                  <h4 className="text-sm font-black uppercase text-neutral-900">
                    {isArabic ? 'قسم خاص لـ الأطقم والتنسيقات الكاملة' : 'Outfit Sets & Bundles'}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {isArabic
                      ? 'إدارة قسم الأطقم الكاملة والتنسيقات الجاهزة بخصومات خاصة على الموقع.'
                      : 'Manage standalone complete outfit sets with bundle discounts.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBundle({
                      id: `bundle-${Date.now().toString(36)}`,
                      name: '',
                      nameAr: '',
                      tagline: '',
                      taglineAr: '',
                      description: '',
                      descriptionAr: '',
                      image: '',
                      galleryImages: [],
                      productIds: products.slice(0, 2).map((p) => p.id),
                      originalPrice: 0,
                      bundlePrice: 0,
                      discountPercent: 0,
                      badge: 'BEST VALUE',
                      badgeAr: 'الأكثر توفيراً'
                    });
                    setIsCreatingBundle(true);
                  }}
                  className="px-3.5 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase rounded flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isArabic ? 'إضافة طقم جديد' : 'Add New Set'}</span>
                </button>
              </div>

              {/* Bundles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundles.map((bundle) => {
                  const includedProducts = bundle.productIds
                    .map((id) => products.find((p) => p.id === id))
                    .filter(Boolean) as Product[];

                  return (
                    <div
                      key={bundle.id}
                      className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative aspect-square sm:w-44 bg-neutral-100 shrink-0">
                          <img
                            src={bundle.image}
                            alt={bundle.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 uppercase rounded">
                            {bundle.discountPercent}% OFF
                          </span>
                        </div>

                        <div className="p-3.5 flex-1 min-w-0">
                          <div className="text-[10px] font-black uppercase text-neutral-500 mb-0.5">
                            {isArabic ? `طقم (${includedProducts.length} قطع)` : `SET (${includedProducts.length} PIECES)`}
                          </div>
                          <h4 className="text-sm font-black uppercase text-neutral-900 truncate">
                            {isArabic ? bundle.nameAr : bundle.name}
                          </h4>
                          <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                            {isArabic ? bundle.descriptionAr : bundle.description}
                          </p>

                          <div className="mt-2 flex items-baseline space-x-2 rtl:space-x-reverse">
                            <span className="text-sm font-black text-black">
                              {bundle.bundlePrice} LE
                            </span>
                            <span className="text-xs text-neutral-400 line-through">
                              {bundle.originalPrice} LE
                            </span>
                          </div>

                          {/* Included items chips */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {includedProducts.map((p) => (
                              <span
                                key={p.id}
                                className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-700 truncate max-w-[140px]"
                              >
                                {isArabic ? p.nameAr || p.name : p.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-2.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-neutral-400">
                          {bundle.id}
                        </span>
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBundle(bundle);
                              setIsCreatingBundle(false);
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-neutral-700 hover:text-black hover:bg-neutral-200 rounded transition cursor-pointer flex items-center space-x-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'تعديل' : 'Edit'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBundle(bundle.id)}
                            className="px-2.5 py-1 text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition cursor-pointer flex items-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'حذف' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS & SHIPPING STATUS & ARCHIVE */}
          {activeTab === 'orders' && (
            <AdminOrdersTab
              orders={orders}
              onUpdateOrderStatus={onUpdateOrderStatus || (() => {})}
              products={products}
              isArabic={isArabic}
            />
          )}

          {/* TAB 6: CUSTOMER REGISTRY */}
          {activeTab === 'customers' && (
            <AdminCustomersTab
              orders={orders}
              isArabic={isArabic}
            />
          )}

          {/* TAB 7: SETTINGS, FOOTER, WALLETS & RESET */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <AdminSettingsTab
                products={products}
                categories={categories}
                isArabic={isArabic}
                onNotify={(msg) => showNotification(msg)}
              />

              {/* Reset Catalog to Baseline */}
              <div className="p-4 sm:p-5 bg-white border border-red-200 rounded-lg space-y-3">
                <h4 className="text-sm font-black uppercase tracking-wider text-red-700">
                  {isArabic ? 'إعادة ضبط الكتالوج الأساسي في فايربيس' : 'Reset Catalog to Baseline in Firebase'}
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {isArabic
                    ? 'يمكنك استعادة المنتجات والأقسام والأطقم الأساسية ومزامنتها مباشرة مع قاعدة بيانات فايربيس.'
                    : 'Restore initial catalog products, categories, and bundles directly into Firebase Firestore.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        isArabic
                          ? 'هل أنت متأكد من إعادة ضبط الكتالوج الأساسي في فايربيس؟'
                          : 'Are you sure you want to restore baseline catalog data in Firebase?'
                      )
                    ) {
                      onResetDefaults();
                      showNotification(isArabic ? 'تمت استعادة الكتالوج الأساسي ومزامنته مع فايربيس بنجاح' : 'Catalog restored and synchronized with Firebase');
                    }
                  }}
                  className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isArabic ? 'إعادة ضبط الكتالوج في فايربيس' : 'Reset Catalog in Firebase'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: BACKUP, RESTORE & PURGE */}
          {activeTab === 'backup' && allowedTabs.includes('backup') && (
            <AdminBackupTab
              products={products}
              categories={categories}
              bundles={bundles}
              orders={orders}
              onSaveProducts={onSaveProducts}
              onSaveCategories={onSaveCategories}
              onSaveBundles={onSaveBundles}
              onUpdateOrders={onUpdateOrders || (() => {})}
              onResetDefaults={onResetDefaults}
              isArabic={isArabic}
              onNotify={(msg) => showNotification(msg)}
            />
          )}

          {/* TAB 9: USERS, PASSWORDS & ROLE PERMISSIONS */}
          {activeTab === 'users' && allowedTabs.includes('users') && (
            <AdminUsersTab
              isArabic={isArabic}
              onNotify={(msg) => showNotification(msg)}
            />
          )}
        </div>

        {/* ========================================================= */}
        {/* SUB-MODAL 1: PRODUCT EDIT / CREATE FORM */}
        {/* ========================================================= */}
        {editingProduct && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
            <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-neutral-200">
              <div className="p-4 bg-neutral-950 text-white flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider">
                  {isCreatingProduct
                    ? isArabic
                      ? 'إضافة منتج جديد'
                      : 'Add New Product'
                    : isArabic
                    ? `تعديل منتج: ${editingProduct.nameAr || editingProduct.name}`
                    : `Edit Product: ${editingProduct.name}`}
                </h4>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveProduct(editingProduct);
                }}
                className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs"
              >
                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      {isArabic ? 'اسم المنتج (عربي) *' : 'Product Name (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.nameAr || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, nameAr: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      {isArabic ? 'اسم المنتج (إنجليزي) *' : 'Product Name (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Category & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      {isArabic ? 'القسم *' : 'Category *'}
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {isArabic ? c.nameAr : c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase text-neutral-700">
                        {isArabic ? 'شارة التميز المكتوبة (Badge)' : 'Custom Badge Text'}
                      </label>
                      {editingProduct.badge && (
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, badge: undefined })}
                          className="text-[10px] text-red-600 hover:underline cursor-pointer"
                        >
                          {isArabic ? 'مسح الشارة' : 'Clear'}
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder={isArabic ? 'اكتب نص الشارة هنا (مثال: الأكثر طلباً، حصري، قطعة أخيرة)' : 'e.g. BESTSELLER, HOT, LIMITED'}
                      value={editingProduct.badge || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['الأكثر طلباً', 'وصل حديثاً', 'إصدار حصري', 'BESTSELLER', 'NEW', 'HOT'].map((suggest) => (
                        <button
                          key={suggest}
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, badge: suggest })}
                          className="px-1.5 py-0.5 bg-neutral-200 hover:bg-black hover:text-white text-neutral-800 text-[10px] font-bold rounded transition cursor-pointer"
                        >
                          {suggest}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-50 rounded border border-neutral-200">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      {isArabic ? 'السعر الأصلي (LE)' : 'Original Price (LE)'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editingProduct.originalPrice}
                      onChange={(e) => {
                        const orig = Number(e.target.value);
                        const disc = editingProduct.discountedPrice;
                        const pct = orig > disc ? Math.round(((orig - disc) / orig) * 100) : 0;
                        setEditingProduct({ ...editingProduct, originalPrice: orig, discountPercent: pct });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      {isArabic ? 'السعر بعد الخصم (LE)' : 'Discounted Price (LE)'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editingProduct.discountedPrice}
                      onChange={(e) => {
                        const disc = Number(e.target.value);
                        const orig = editingProduct.originalPrice;
                        const pct = orig > disc ? Math.round(((orig - disc) / orig) * 100) : 0;
                        setEditingProduct({ ...editingProduct, discountedPrice: disc, discountPercent: pct });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-bold text-red-600"
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      {isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}
                    </label>
                    <textarea
                      rows={2}
                      value={editingProduct.descriptionAr || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, descriptionAr: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      {isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}
                    </label>
                    <textarea
                      rows={2}
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-medium"
                    />
                  </div>
                </div>

                {/* SIZES AND STOCK QUANTITY PER SIZE ("عدد كل مقاس باللون وكل شئ بكرت المنتج") */}
                <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-neutral-800">
                      {isArabic ? 'المقاسات والمخزون المتاح لكل مقاس *' : 'Sizes & Stock Count *'}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {isArabic ? 'حدد عدد القطع المتاحة لكل مقاس' : 'Specify available units per size'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {(['S', 'M', 'L', 'XL', 'XXL', '3XL'] as const).map((sizeKey) => {
                      const sizeObj = editingProduct.sizes.find((s) => s.size === sizeKey) || {
                        size: sizeKey,
                        inStock: true,
                        stockCount: 10
                      };

                      return (
                        <div key={sizeKey} className="p-2 bg-white rounded border border-neutral-300 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-xs">{sizeKey}</span>
                            <input
                              type="checkbox"
                              checked={sizeObj.inStock}
                              onChange={(e) => {
                                const updatedSizes = editingProduct.sizes.map((s) =>
                                  s.size === sizeKey ? { ...s, inStock: e.target.checked } : s
                                );
                                if (!editingProduct.sizes.some((s) => s.size === sizeKey)) {
                                  updatedSizes.push({ size: sizeKey, inStock: e.target.checked, stockCount: 10 });
                                }
                                setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                              }}
                              className="w-3.5 h-3.5 accent-black cursor-pointer"
                              title="In Stock"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] text-neutral-500 block">
                              {isArabic ? 'العدد' : 'Qty'}
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={sizeObj.stockCount || 0}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updatedSizes = editingProduct.sizes.map((s) =>
                                  s.size === sizeKey ? { ...s, stockCount: val, inStock: val > 0 } : s
                                );
                                if (!editingProduct.sizes.some((s) => s.size === sizeKey)) {
                                  updatedSizes.push({ size: sizeKey, inStock: val > 0, stockCount: val });
                                }
                                setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                              }}
                              className="w-full px-1.5 py-1 border border-neutral-300 rounded text-xs font-mono font-bold"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* COLORS & IMAGES */}
                <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-neutral-800">
                      {isArabic ? 'الألوان والصور الملحقة' : 'Colors & Images'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newColor: ProductColor = {
                          id: `c-${Date.now().toString(36)}`,
                          name: 'New Color',
                          hex: '#000000',
                          images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop']
                        };
                        setEditingProduct({
                          ...editingProduct,
                          colors: [...editingProduct.colors, newColor]
                        });
                      }}
                      className="px-2 py-1 bg-black text-white text-[10px] font-bold rounded cursor-pointer"
                    >
                      + {isArabic ? 'إضافة لون جديد' : 'Add Color'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingProduct.colors.map((col, cIdx) => (
                      <div key={col.id} className="p-2.5 bg-white rounded border border-neutral-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <input
                              type="color"
                              value={col.hex}
                              onChange={(e) => {
                                const newColors = [...editingProduct.colors];
                                newColors[cIdx].hex = e.target.value;
                                setEditingProduct({ ...editingProduct, colors: newColors });
                              }}
                              className="w-7 h-7 rounded border border-neutral-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={col.name}
                              onChange={(e) => {
                                const newColors = [...editingProduct.colors];
                                newColors[cIdx].name = e.target.value;
                                setEditingProduct({ ...editingProduct, colors: newColors });
                              }}
                              placeholder="Color Name"
                              className="px-2 py-1 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold"
                            />
                          </div>

                          {editingProduct.colors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newColors = editingProduct.colors.filter((_, idx) => idx !== cIdx);
                                setEditingProduct({ ...editingProduct, colors: newColors });
                              }}
                              className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Image URL input */}
                        <div>
                          <label className="text-[10px] text-neutral-500 block mb-0.5">
                            {isArabic ? 'رابط الصورة الأساسية لهذا اللون:' : 'Main Image URL:'}
                          </label>
                          <input
                            type="url"
                            value={col.images[0] || ''}
                            onChange={(e) => {
                              const newColors = [...editingProduct.colors];
                              newColors[cIdx].images = [e.target.value, ...newColors[cIdx].images.slice(1)];
                              setEditingProduct({ ...editingProduct, colors: newColors });
                            }}
                            className="w-full px-2 py-1 bg-neutral-50 border border-neutral-300 rounded text-xs font-mono"
                          />
                        </div>

                        {/* Granular stock per size for this color ("اريد عدد المقاس المتاح لكل لون بالمقاس باضافة منتج") */}
                        <div className="pt-2 border-t border-neutral-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-neutral-800">
                              {isArabic ? 'المخزون المتاح لكل مقاس بهذا اللون *' : 'Stock per size for this color *'}
                            </span>
                            <span className="text-[9px] text-neutral-500">
                              {isArabic ? 'حدد الكمية المتاحة لكل مقاس' : 'Units per size'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                            {(['S', 'M', 'L', 'XL', 'XXL', '3XL'] as const).map((sz) => {
                              const currentStock =
                                col.sizesStock?.find((s) => s.size === sz)?.stockCount ?? 10;
                              return (
                                <div
                                  key={sz}
                                  className="p-1.5 bg-neutral-50 rounded border border-neutral-200 text-center space-y-1"
                                >
                                  <span className="text-[10px] font-black font-mono block text-neutral-900">
                                    {sz}
                                  </span>
                                  <input
                                    type="number"
                                    min={0}
                                    value={currentStock}
                                    onChange={(e) => {
                                      const val = Math.max(0, Number(e.target.value));
                                      const newColors = [...editingProduct.colors];
                                      const existingStock = newColors[cIdx].sizesStock || [];
                                      const updatedStock = (['S', 'M', 'L', 'XL', 'XXL', '3XL'] as const).map(
                                        (sKey) => {
                                          if (sKey === sz) return { size: sKey, stockCount: val };
                                          const prev = existingStock.find((st) => st.size === sKey);
                                          return prev || { size: sKey, stockCount: 10 };
                                        }
                                      );
                                      newColors[cIdx].sizesStock = updatedStock;

                                      // Also keep overall editingProduct.sizes in sync
                                      const allSizes = (['S', 'M', 'L', 'XL', 'XXL', '3XL'] as const).map(
                                        (sKey) => {
                                          const totalForSize = newColors.reduce((sum, c) => {
                                            const found = c.sizesStock?.find((st) => st.size === sKey);
                                            return sum + (found ? found.stockCount : 10);
                                          }, 0);
                                          return {
                                            size: sKey,
                                            stockCount: totalForSize,
                                            inStock: totalForSize > 0
                                          };
                                        }
                                      );

                                      setEditingProduct({
                                        ...editingProduct,
                                        colors: newColors,
                                        sizes: allSizes
                                      });
                                    }}
                                    className="w-full text-center px-1 py-0.5 bg-white border border-neutral-300 rounded font-mono font-bold text-xs"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Placement & Visibility: وصل حديثاً أو الأكثر مبيعاً */}
                <div className="p-3.5 bg-neutral-50 rounded border border-neutral-200 space-y-2.5">
                  <label className="block text-[11px] font-bold uppercase text-neutral-800">
                    {isArabic ? 'مكان ظهور المنتج في الصفحة الرئيسية (إبراز المنتج):' : 'Homepage Feature Placements:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center space-x-2.5 rtl:space-x-reverse p-3 bg-white rounded border border-neutral-300 cursor-pointer hover:border-black transition">
                      <input
                        type="checkbox"
                        checked={editingProduct.showInNewArrivals ?? editingProduct.isNewArrival ?? false}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          showInNewArrivals: e.target.checked,
                          isNewArrival: e.target.checked
                        })}
                        className="w-4 h-4 accent-black cursor-pointer shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="font-black text-neutral-900">
                          {isArabic ? 'إبراز في قسم "وصل حديثاً"' : 'Feature in "New Arrivals"'}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {isArabic ? 'يظهر بالواجهة تحت قسم وصل حديثاً' : 'Display under New Arrivals section'}
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-2.5 rtl:space-x-reverse p-3 bg-white rounded border border-neutral-300 cursor-pointer hover:border-black transition">
                      <input
                        type="checkbox"
                        checked={editingProduct.showInBestSellers ?? false}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          showInBestSellers: e.target.checked
                        })}
                        className="w-4 h-4 accent-black cursor-pointer shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="font-black text-neutral-900">
                          {isArabic ? 'إبراز في قسم "الأكثر مبيعاً"' : 'Feature in "Best Sellers"'}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {isArabic ? 'يظهر بالواجهة في قسم الأكثر مبيعاً' : 'Display under Best Sellers section'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* صور أطقم مربوطة بهذا المنتج وإطلالات مكملة ("و ضيف مكان لصور أطقم مربوطه بها ومن لوحة التحكم تضاف و تتغير") */}
                <div className="p-3.5 bg-neutral-50 rounded border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <ImageIcon className="w-4 h-4 text-neutral-800" />
                      <span className="text-[11px] font-black uppercase text-neutral-900">
                        {isArabic ? 'صور أطقم وإطلالات مربوطة بهذا المنتج (Outfit Photos):' : 'Linked Outfit & Look Photos:'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-500">
                      {editingProduct.outfitImages?.length || 0} {isArabic ? 'صور أطقم' : 'outfit photos'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    {isArabic
                      ? 'أضف صور إطلالات كاملة أو أطقم متناسقة يرتدي فيها الموديل هذا المنتج. ستظهر هذه الصور والأطقم المكملة أسفل هذا المنتج في صفحة المنتج.'
                      : 'Add outfit and look photos featuring this product. These will appear in the Complementary Outfits section at the bottom of this product page.'}
                  </p>

                  {/* Existing Outfit Images Thumbnails */}
                  {editingProduct.outfitImages && editingProduct.outfitImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 p-2.5 bg-white rounded border border-neutral-300">
                      {editingProduct.outfitImages.map((outfitImg, idx) => (
                        <div key={idx} className="relative group aspect-[3/4] bg-neutral-100 rounded overflow-hidden border border-neutral-200 shadow-xs">
                          <img src={outfitImg} alt={`Outfit ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingProduct.outfitImages!.filter((_, i) => i !== idx);
                              setEditingProduct({ ...editingProduct, outfitImages: updated });
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                            title={isArabic ? 'حذف صورة الطقم' : 'Delete photo'}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Outfit Image Tools */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <div className="flex-1 flex gap-1.5">
                      <input
                        type="url"
                        placeholder={isArabic ? 'أدخل رابط صورة طقم (URL)...' : 'Paste outfit photo URL...'}
                        value={productOutfitUrlInput}
                        onChange={(e) => setProductOutfitUrlInput(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (productOutfitUrlInput.trim()) {
                            const current = editingProduct.outfitImages || [];
                            setEditingProduct({
                              ...editingProduct,
                              outfitImages: [...current, productOutfitUrlInput.trim()]
                            });
                            setProductOutfitUrlInput('');
                            showNotification(isArabic ? 'تمت إضافة صورة الطقم' : 'Outfit photo added');
                          }
                        }}
                        className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded cursor-pointer shrink-0"
                      >
                        {isArabic ? 'إضافة بالرابط' : 'Add URL'}
                      </button>
                    </div>

                    <label className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded text-xs font-bold text-neutral-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'رفع صورة من الجهاز' : 'Upload from Device'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const result = reader.result as string;
                              if (result) {
                                const current = editingProduct.outfitImages || [];
                                setEditingProduct({
                                  ...editingProduct,
                                  outfitImages: [...current, result]
                                });
                                showNotification(isArabic ? 'تم رفع صورة الطقم بنجاح' : 'Outfit photo uploaded');
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Link to Existing Bundles */}
                  {bundles.length > 0 && (
                    <div className="pt-2 border-t border-neutral-200">
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1.5">
                        {isArabic ? 'ربط هذا المنتج بأطقم وتنسيقات سوترة الكاملة:' : 'Link with SOTRA Outfit Bundles:'}
                      </label>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto bg-white p-2 rounded border border-neutral-300 text-xs">
                        {bundles.map((b) => {
                          const isLinked = (editingProduct.linkedBundleIds || []).includes(b.id) || b.productIds.includes(editingProduct.id);
                          return (
                            <label key={b.id} className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer hover:bg-neutral-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={isLinked}
                                onChange={(e) => {
                                  const current = editingProduct.linkedBundleIds || [];
                                  const next = e.target.checked
                                    ? [...current, b.id]
                                    : current.filter((id) => id !== b.id);
                                  setEditingProduct({ ...editingProduct, linkedBundleIds: next });
                                }}
                                className="w-3.5 h-3.5 accent-black cursor-pointer"
                              />
                              <span className="font-semibold text-neutral-800">
                                {isArabic ? b.nameAr || b.name : b.name}
                              </span>
                              <span className="text-[10px] text-neutral-500">
                                ({b.bundlePrice} LE • {b.discountPercent}% OFF)
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end space-x-2 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 border border-neutral-300 text-neutral-700 font-bold rounded cursor-pointer hover:bg-neutral-100"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-black text-white font-black uppercase rounded cursor-pointer hover:bg-neutral-800 shadow-md"
                  >
                    {isArabic ? 'حفظ المنتج' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-MODAL 2: CATEGORY EDIT / CREATE FORM */}
        {/* ========================================================= */}
        {editingCategory && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 animate-in fade-in">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden p-5 space-y-4 border border-neutral-200">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <h4 className="text-sm font-black uppercase">
                  {isCreatingCategory
                    ? isArabic
                      ? 'إضافة قسم جديد'
                      : 'Add Category'
                    : isArabic
                    ? 'تعديل القسم'
                    : 'Edit Category'}
                </h4>
                <button onClick={() => setEditingCategory(null)} className="cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveCategory(editingCategory);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {isArabic ? 'اسم القسم (عربي) *' : 'Category Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCategory.nameAr}
                    onChange={(e) => setEditingCategory({ ...editingCategory, nameAr: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {isArabic ? 'اسم القسم (إنجليزي) *' : 'Category Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {isArabic ? 'معرف القسم (ID/Slug) *' : 'Category ID (Slug) *'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isCreatingCategory}
                    value={editingCategory.id}
                    onChange={(e) => setEditingCategory({ ...editingCategory, id: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-mono disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {isArabic ? 'رابط صورة القسم (Image URL) *' : 'Image URL *'}
                  </label>
                  <input
                    type="url"
                    required
                    value={editingCategory.image}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {isArabic ? 'رابط صورة غلاف القسم العلوية (Cover Banner URL) - اختياري' : 'Category Top Cover Banner (Optional)'}
                  </label>
                  <input
                    type="url"
                    value={editingCategory.coverImage || ''}
                    placeholder="https://..."
                    onChange={(e) => setEditingCategory({ ...editingCategory, coverImage: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {isArabic ? 'وصف القسم (عربي) - مثل: حقائب سفر وإكسسوارات وجوارب قطنية أساسية...' : 'Category Description (Arabic)'}
                  </label>
                  <textarea
                    rows={2}
                    value={editingCategory.descriptionAr || ''}
                    placeholder={isArabic ? 'حقائب سفر وإكسسوارات وجوارب قطنية أساسية مصممة بأعلى معايير الجودة لتناسب أناقتك اليومية...' : ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, descriptionAr: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {isArabic ? 'وصف القسم (إنجليزي) - اختياري' : 'Category Description (English) - Optional'}
                  </label>
                  <textarea
                    rows={2}
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs leading-relaxed"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCategory.showInShopByCategory ?? true}
                      onChange={(e) => setEditingCategory({ ...editingCategory, showInShopByCategory: e.target.checked })}
                      className="w-4 h-4 accent-black cursor-pointer"
                    />
                    <span className="text-xs font-bold text-neutral-800">
                      {isArabic ? 'إبراز هذا القسم في "تسوق حسب الأقسام" بالصفحة الرئيسية' : 'Highlight in "Shop by Category" on Home'}
                    </span>
                  </label>
                </div>

                <div className="pt-2 flex justify-end space-x-2 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-3 py-1.5 border border-neutral-300 rounded font-bold cursor-pointer"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-black text-white font-bold rounded cursor-pointer hover:bg-neutral-800"
                  >
                    {isArabic ? 'حفظ القسم' : 'Save Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-MODAL 3: BUNDLE EDIT / CREATE FORM */}
        {/* ========================================================= */}
        {editingBundle && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 animate-in fade-in">
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-neutral-200">
              <div className="p-4 bg-neutral-950 text-white flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider">
                  {isCreatingBundle
                    ? isArabic
                      ? 'إضافة طقم كامل جديد'
                      : 'Add New Outfit Set'
                    : isArabic
                    ? `تعديل طقم: ${editingBundle.nameAr}`
                    : `Edit Set: ${editingBundle.name}`}
                </h4>
                <button onClick={() => setEditingBundle(null)} className="cursor-pointer text-neutral-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveBundle(editingBundle);
                }}
                className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      {isArabic ? 'اسم الطقم (عربي) *' : 'Bundle Name (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editingBundle.nameAr}
                      onChange={(e) => setEditingBundle({ ...editingBundle, nameAr: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      {isArabic ? 'اسم الطقم (إنجليزي) *' : 'Bundle Name (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editingBundle.name}
                      onChange={(e) => setEditingBundle({ ...editingBundle, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-medium"
                    />
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {isArabic ? 'رابط صورة الطقم المنسق *' : 'Showcase Outfit Image URL *'}
                  </label>
                  <input
                    type="url"
                    required
                    value={editingBundle.image}
                    onChange={(e) => setEditingBundle({ ...editingBundle, image: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded font-mono"
                  />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-50 rounded border border-neutral-200">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-700 mb-1">
                      {isArabic ? 'السعر الأصلي' : 'Original Price'}
                    </label>
                    <input
                      type="number"
                      required
                      value={editingBundle.originalPrice}
                      onChange={(e) => setEditingBundle({ ...editingBundle, originalPrice: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-white border border-neutral-300 rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-700 mb-1">
                      {isArabic ? 'سعر الطقم بعد الخصم' : 'Bundle Price'}
                    </label>
                    <input
                      type="number"
                      required
                      value={editingBundle.bundlePrice}
                      onChange={(e) => {
                        const bPrice = Number(e.target.value);
                        const oPrice = editingBundle.originalPrice;
                        const pct = oPrice > bPrice ? Math.round(((oPrice - bPrice) / oPrice) * 100) : 0;
                        setEditingBundle({ ...editingBundle, bundlePrice: bPrice, discountPercent: pct });
                      }}
                      className="w-full px-2 py-1 bg-white border border-neutral-300 rounded font-bold text-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-700 mb-1">
                      {isArabic ? 'نسبة الخصم %' : 'Discount %'}
                    </label>
                    <input
                      type="number"
                      value={editingBundle.discountPercent}
                      onChange={(e) => setEditingBundle({ ...editingBundle, discountPercent: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-white border border-neutral-300 rounded font-bold"
                    />
                  </div>
                </div>

                {/* Included Products Multi-selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-neutral-700">
                      {isArabic ? 'المنتجات المشمولة في هذا الطقم (اختر 2 أو أكثر) *' : 'Included Products (Select 2+) *'}
                    </label>
                    <span className="text-[10px] text-neutral-500 font-bold">
                      {editingBundle.productIds.length} {isArabic ? 'محددة' : 'selected'}
                    </span>
                  </div>

                  {/* Search bar inside bundle products selection */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 rtl:left-auto rtl:right-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={bundleSearchQuery}
                      onChange={(e) => setBundleSearchQuery(e.target.value)}
                      placeholder={isArabic ? 'ابحث في المنتجات لإضافتها للطقم...' : 'Search products to include in set...'}
                      className="w-full pl-8 rtl:pl-2.5 rtl:pr-8 pr-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-semibold focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="border border-neutral-200 rounded p-2 max-h-44 overflow-y-auto space-y-1 bg-neutral-50">
                    {products
                      .filter((p) => {
                        const q = bundleSearchQuery.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          p.name.toLowerCase().includes(q) ||
                          (p.nameAr && p.nameAr.toLowerCase().includes(q)) ||
                          p.id.toLowerCase().includes(q)
                        );
                      })
                      .map((p) => {
                        const isChecked = editingBundle.productIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center space-x-2 rtl:space-x-reverse cursor-pointer p-1.5 rounded transition ${
                              isChecked ? 'bg-black text-white font-bold' : 'hover:bg-neutral-100 text-neutral-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const nextIds = e.target.checked
                                  ? [...editingBundle.productIds, p.id]
                                  : editingBundle.productIds.filter((id) => id !== p.id);
                                setEditingBundle({ ...editingBundle, productIds: nextIds });
                              }}
                              className="w-3.5 h-3.5 accent-black cursor-pointer"
                            />
                            <span className="truncate text-xs flex-1">
                              {isArabic ? p.nameAr || p.name : p.name}
                            </span>
                            <span className={`text-[11px] font-mono shrink-0 ${isChecked ? 'text-neutral-200' : 'text-neutral-500'}`}>
                              {p.discountedPrice} LE
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end space-x-2 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setEditingBundle(null)}
                    className="px-3 py-1.5 border border-neutral-300 rounded font-bold cursor-pointer"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-black text-white font-bold rounded cursor-pointer hover:bg-neutral-800"
                  >
                    {isArabic ? 'حفظ الطقم' : 'Save Bundle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
