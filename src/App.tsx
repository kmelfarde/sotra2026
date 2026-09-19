import React, { useState, useEffect, useMemo } from 'react';
import { CURRENCY_RATES } from './data/products';
import {
  Product,
  CartItem,
  CategoryTab,
  CurrencyCode,
  FilterOptions,
  OutfitBundle,
  CustomerProfile,
  CustomerOrder,
  StoreCategory,
  OrderStatusType,
  BroadcastNotification,
  SitePromoPopup
} from './types';
import { Header } from './components/Header';
import { HomeStoreView } from './components/HomeStoreView';
import { CategoryCarousel } from './components/CategoryCarousel';
import { ProductGrid } from './components/ProductGrid';
import { CategoryPage } from './components/CategoryPage';
import { BundlesSection } from './components/BundlesSection';
import { BundleModal } from './components/BundleModal';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { FilterDrawer } from './components/FilterDrawer';
import { SearchModal } from './components/SearchModal';
import { NotificationModal } from './components/NotificationModal';
import { MobileMenu } from './components/MobileMenu';
import { SizeGuideModal } from './components/SizeGuideModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { BroadcastBanner } from './components/BroadcastBanner';
import { PromoPopupModal } from './components/PromoPopupModal';
import { getBroadcastNotification, getPromoPopupSettings } from './utils/storeSettings';
import { orderAlarm, getAcknowledgedOrderIds, markOrdersAsAcknowledged } from './utils/audioAlarm';
import { Check } from 'lucide-react';
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToBundles,
  subscribeToOrders,
  saveProductsBatchToFirestore,
  saveCategoriesBatchToFirestore,
  saveBundlesBatchToFirestore,
  createOrderInFirestore,
  updateOrderInFirestore,
  deleteOrderFromFirestore,
  saveProductToFirestore
} from './firebase/db';
import { initializeFirestoreDataIfNeeded, zeroOutStoreCompletely } from './firebase/seed';

export default function App() {
  // Locale and Currency State - Primary default is Arabic
  const [isArabic, setIsArabic] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sotra_lang');
      if (saved) return saved === 'ar';
      return true;
    } catch {
      return true;
    }
  });
  const [currency, setCurrency] = useState<CurrencyCode>('EGP');

  // Customer Profile & Address Book
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    try {
      const saved = localStorage.getItem('sotra_customer_profile');
      return saved
        ? JSON.parse(saved)
        : {
            name: '',
            phone: '',
            whatsapp: '',
            governorate: 'القاهرة',
            address: ''
          };
    } catch {
      return {
        name: '',
        phone: '',
        whatsapp: '',
        governorate: 'القاهرة',
        address: ''
      };
    }
  });

  // Customer Orders Record - Real-time Firestore synchronized
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem('sotra_customer_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Categories & Dedicated Category Page View
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>('all');
  const [activeCategoryView, setActiveCategoryView] = useState<CategoryTab | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    fit: [],
    sizes: [],
    colors: [],
    minPrice: 0,
    maxPrice: 2000,
    sortBy: 'featured',
    searchQuery: '',
    onlyDiscounted: false,
    onlyInStock: false
  });

  // Cart State (Persisted in localStorage for visitor session)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sotra_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Promo Code State
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Modals & Drawers Visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);

  // Selected Product for Detail Modal
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeColorId, setActiveColorId] = useState<string | undefined>(undefined);

  // Selected Bundle for Customization Modal
  const [activeBundle, setActiveBundle] = useState<OutfitBundle | null>(null);

  // Quick Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Products, Categories, and Bundles - Firestore Real-time synchronized
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sotra_products_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [categories, setCategories] = useState<StoreCategory[]>(() => {
    try {
      const saved = localStorage.getItem('sotra_categories_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [bundles, setBundles] = useState<OutfitBundle[]>(() => {
    try {
      const saved = localStorage.getItem('sotra_bundles_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Admin Modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // 1. Initial Firestore Bootstrap & Real-time Listeners
  useEffect(() => {
    // Check and seed initial data if Firestore is currently empty
    initializeFirestoreDataIfNeeded().catch(console.error);

    // Subscribe to real-time Products from Firebase
    const unsubProducts = subscribeToProducts((firestoreProducts) => {
      setProducts(firestoreProducts);
      try {
        localStorage.setItem('sotra_products_data', JSON.stringify(firestoreProducts));
      } catch (e) {
        console.error(e);
      }
    });

    // Subscribe to real-time Categories from Firebase
    const unsubCategories = subscribeToCategories((firestoreCategories) => {
      const mapped = firestoreCategories.map((c) => ({
        ...c,
        showInShopByCategory: c.id !== 'all' && c.id !== 'sets'
      }));
      setCategories(mapped);
      try {
        localStorage.setItem('sotra_categories_data', JSON.stringify(mapped));
      } catch (e) {
        console.error(e);
      }
    });

    // Subscribe to real-time Bundles from Firebase
    const unsubBundles = subscribeToBundles((firestoreBundles) => {
      setBundles(firestoreBundles);
      try {
        localStorage.setItem('sotra_bundles_data', JSON.stringify(firestoreBundles));
      } catch (e) {
        console.error(e);
      }
    });

    // Subscribe to real-time Orders
    const unsubOrders = subscribeToOrders((firestoreOrders) => {
      setCustomerOrders(firestoreOrders);
      try {
        localStorage.setItem('sotra_customer_orders', JSON.stringify(firestoreOrders));
      } catch (e) {
        console.error(e);
      }
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBundles();
      unsubOrders();
    };
  }, []);

  // Order alarm & acknowledgment sync state
  const [acknowledgedOrders, setAcknowledgedOrders] = useState<string[]>(() => getAcknowledgedOrderIds());

  useEffect(() => {
    const handleSync = () => {
      setAcknowledgedOrders(getAcknowledgedOrderIds());
    };
    window.addEventListener('sotra_orders_acknowledged', handleSync);
    return () => window.removeEventListener('sotra_orders_acknowledged', handleSync);
  }, []);

  // Pending unreceived orders that should trigger the alarm
  const pendingAlarmOrders = useMemo(() => {
    return customerOrders.filter(
      (o) => o.status !== 'delivered' && o.status !== 'cancelled' && !acknowledgedOrders.includes(o.orderId)
    );
  }, [customerOrders, acknowledgedOrders]);

  // Ring continuously whenever there are unacknowledged orders
  useEffect(() => {
    if (pendingAlarmOrders.length > 0) {
      orderAlarm.start();
    } else {
      orderAlarm.stop();
    }
  }, [pendingAlarmOrders.length]);

  const handleReceiveAllOrders = () => {
    if (pendingAlarmOrders.length === 0) return;
    const ids = pendingAlarmOrders.map((o) => o.orderId);
    markOrdersAsAcknowledged(ids);
    setAcknowledgedOrders(getAcknowledgedOrderIds());
    showToast(isArabic ? 'تم استلام الطلب وإيقاف النغمة بنجاح' : 'Order received - alarm stopped');
  };

  const handleSaveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    try {
      localStorage.setItem('sotra_products_data', JSON.stringify(updatedProducts));
    } catch (e) {
      console.error(e);
    }
    // Sync to Firestore in real-time
    saveProductsBatchToFirestore(updatedProducts).catch(console.error);
  };

  const handleSaveCategories = (updatedCategories: StoreCategory[]) => {
    setCategories(updatedCategories);
    try {
      localStorage.setItem('sotra_categories_data', JSON.stringify(updatedCategories));
    } catch (e) {
      console.error(e);
    }
    // Sync to Firestore in real-time
    saveCategoriesBatchToFirestore(updatedCategories).catch(console.error);
  };

  const handleSaveBundles = (updatedBundles: OutfitBundle[]) => {
    setBundles(updatedBundles);
    try {
      localStorage.setItem('sotra_bundles_data', JSON.stringify(updatedBundles));
    } catch (e) {
      console.error(e);
    }
    // Sync to Firestore in real-time
    saveBundlesBatchToFirestore(updatedBundles).catch(console.error);
  };

  const handleResetDefaults = () => {
    try {
      localStorage.removeItem('sotra_products_data');
      localStorage.removeItem('sotra_categories_data');
      localStorage.removeItem('sotra_bundles_data');
      localStorage.removeItem('sotra_customer_orders');
      localStorage.removeItem('sotra_cart');
      localStorage.removeItem('sotra_acknowledged_orders');
    } catch (e) {
      console.error(e);
    }
    zeroOutStoreCompletely().then(() => {
      setProducts([]);
      setBundles([]);
      setCustomerOrders([]);
      setToastMessage(isArabic ? 'تم تصفير الموقع وحذف البيانات من فايربيس بنجاح' : 'Store zeroed out in Firebase successfully');
      setTimeout(() => setToastMessage(null), 3000);
    });
  };

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem('sotra_admin_auth');
    } catch (e) {
      console.error(e);
    }
    setIsAdminDashboardOpen(false);
    setToastMessage(isArabic ? 'تم تسجيل الخروج من لوحة الإدارة' : 'Logged out of admin panel');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const shopByCategoryTiles = useMemo(() => {
    return categories.filter((c) => c.showInShopByCategory && c.id !== 'all' && c.id !== 'sets');
  }, [categories]);

  // Quick lookup map for products by ID
  const productsMap = useMemo(() => {
    const map: Record<string, Product> = {};
    products.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [products]);

  // Sync Language and Direction with HTML document
  useEffect(() => {
    try {
      localStorage.setItem('sotra_lang', isArabic ? 'ar' : 'en');
      document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
      document.documentElement.lang = isArabic ? 'ar' : 'en';
    } catch (e) {
      console.error('Failed to sync language', e);
    }
  }, [isArabic]);

  // Save Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sotra_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [cartItems]);

  // Site-wide dynamic settings (Broadcast banner & Promo popup)
  const [notificationSettings, setNotificationSettings] = useState<BroadcastNotification>(() => getBroadcastNotification());
  const [promoSettings, setPromoSettings] = useState<SitePromoPopup>(() => getPromoPopupSettings());
  const [isPromoPopupOpen, setIsPromoPopupOpen] = useState(false);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setNotificationSettings(getBroadcastNotification());
      setPromoSettings(getPromoPopupSettings());
    };
    window.addEventListener('sotra_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('sotra_settings_updated', handleSettingsUpdate);
  }, []);

  // Show promo popup once upon entrance if enabled and not dismissed with "don't show again"
  useEffect(() => {
    try {
      const isHidden = localStorage.getItem('sotra_hide_promo_popup') === 'true';
      if (!isHidden && promoSettings.enabled) {
        const timer = setTimeout(() => {
          setIsPromoPopupOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error(e);
    }
  }, [promoSettings.enabled]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveCustomerProfile = (prof: CustomerProfile) => {
    setCustomerProfile(prof);
    try {
      localStorage.setItem('sotra_customer_profile', JSON.stringify(prof));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  };

  const handleAddCustomerOrder = (order: CustomerOrder) => {
    setCustomerOrders((prev) => {
      const updated = [order, ...prev.filter((o) => o.orderId !== order.orderId)];
      try {
        localStorage.setItem('sotra_customer_orders', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save order', e);
      }
      return updated;
    });
    // Direct sync to Firestore
    createOrderInFirestore(order).catch(console.error);
  };

  // Inventory lifecycle & order status handler:
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatusType) => {
    let updatedProducts = [...products];

    setCustomerOrders((prevOrders) => {
      const orderIndex = prevOrders.findIndex((o) => o.orderId === orderId);
      if (orderIndex === -1) return prevOrders;

      const order = { ...prevOrders[orderIndex] };
      const isDeductingStatus = ['shipping_paid', 'courier', 'delivered'].includes(newStatus);
      const isCancelling = newStatus === 'cancelled';

      // Deduct stock if advancing to shipping_paid, courier, or delivered, and not yet deducted
      if (isDeductingStatus && !order.stockDeducted) {
        order.stockDeducted = true;
        updatedProducts = updatedProducts.map((prod) => {
          const matchingItems = order.items.filter((it) => it.productId === prod.id);
          if (matchingItems.length === 0) return prod;

          let updatedColors = [...prod.colors];
          let updatedSizes = [...prod.sizes];

          matchingItems.forEach((it) => {
            // Deduct from color sizesStock
            updatedColors = updatedColors.map((col) => {
              if (col.name !== it.colorName && col.id !== it.colorName) return col;
              const currentStock = col.sizesStock || [];
              const nextStock = currentStock.map((st) => {
                if (st.size === it.size) {
                  return { ...st, stockCount: Math.max(0, st.stockCount - it.quantity) };
                }
                return st;
              });
              return { ...col, sizesStock: nextStock };
            });

            // Deduct from product sizes
            updatedSizes = updatedSizes.map((sz) => {
              if (sz.size === it.size) {
                const nextCount = Math.max(0, sz.stockCount - it.quantity);
                return { ...sz, stockCount: nextCount, inStock: nextCount > 0 };
              }
              return sz;
            });
          });

          return { ...prod, colors: updatedColors, sizes: updatedSizes };
        });
      }

      // Return stock if cancelling and stock was deducted
      if (isCancelling && order.stockDeducted) {
        order.stockDeducted = false;
        order.cancelledAt = new Date().toISOString();
        updatedProducts = updatedProducts.map((prod) => {
          const matchingItems = order.items.filter((it) => it.productId === prod.id);
          if (matchingItems.length === 0) return prod;

          let updatedColors = [...prod.colors];
          let updatedSizes = [...prod.sizes];

          matchingItems.forEach((it) => {
            // Return to color sizesStock
            updatedColors = updatedColors.map((col) => {
              if (col.name !== it.colorName && col.id !== it.colorName) return col;
              const currentStock = col.sizesStock || [];
              const nextStock = currentStock.map((st) => {
                if (st.size === it.size) {
                  return { ...st, stockCount: st.stockCount + it.quantity };
                }
                return st;
              });
              return { ...col, sizesStock: nextStock };
            });

            // Return to product sizes
            updatedSizes = updatedSizes.map((sz) => {
              if (sz.size === it.size) {
                const nextCount = sz.stockCount + it.quantity;
                return { ...sz, stockCount: nextCount, inStock: nextCount > 0 };
              }
              return sz;
            });
          });

          return { ...prod, colors: updatedColors, sizes: updatedSizes };
        });
      }

      if (newStatus === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date().toISOString();
      }

      order.status = newStatus;
      const statusLabels: Record<string, string> = {
        received: 'تم استلام الطلب',
        shipping_paid: 'تأكيد دفع الشحن',
        courier: 'الطلب بشركة الشحن',
        delivered: 'تم التوصيل بنجاح',
        cancelled: 'تم الغاء الطلب'
      };
      order.statusAr = statusLabels[newStatus] || order.statusAr;

      const nextOrders = [...prevOrders];
      nextOrders[orderIndex] = order;

      try {
        localStorage.setItem('sotra_customer_orders', JSON.stringify(nextOrders));
      } catch (e) {
        console.error('Failed to save updated orders', e);
      }

      // Sync updated order status to Firestore
      updateOrderInFirestore(order.orderId, {
        status: order.status,
        statusAr: order.statusAr,
        stockDeducted: order.stockDeducted,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt
      }).catch(console.error);

      return nextOrders;
    });

    setProducts(updatedProducts);
    try {
      localStorage.setItem('sotra_products_data', JSON.stringify(updatedProducts));
    } catch (e) {
      console.error('Failed to save updated products', e);
    }
    // Sync affected products back to Firestore
    saveProductsBatchToFirestore(updatedProducts).catch(console.error);
  };

  // Switch to a Dedicated Category Page
  const handleOpenCategory = (cat: CategoryTab) => {
    if (cat === 'all') {
      setActiveCategoryView(null);
      setSelectedCategory('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveCategoryView(cat);
      setSelectedCategory(cat);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Back to Main Home Page
  const handleBackToHome = () => {
    setActiveCategoryView(null);
    setSelectedCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (filters.category !== 'all' && product.category !== filters.category) {
        return false;
      }
      // Fit filter
      if (filters.fit && filters.fit.length > 0) {
        if (!product.fit || !filters.fit.includes(product.fit)) {
          return false;
        }
      }
      // Sizes filter
      if (filters.sizes.length > 0) {
        const hasSize = product.sizes.some(
          (s) => filters.sizes.includes(s.size) && s.inStock
        );
        if (!hasSize) return false;
      }
      // Colors filter
      if (filters.colors.length > 0) {
        const hasColor = product.colors.some((c) =>
          filters.colors.includes(c.name)
        );
        if (!hasColor) return false;
      }
      // Price range
      if (
        product.discountedPrice < filters.minPrice ||
        product.discountedPrice > filters.maxPrice
      ) {
        return false;
      }
      // Only discounted
      if (filters.onlyDiscounted && !product.discountedPrice) {
        return false;
      }
      // Only in stock
      if (filters.onlyInStock && !product.inStock) {
        return false;
      }
      // Search query (from both navbar and filter drawer)
      const q = (searchQuery || filters.searchQuery || '').trim().toLowerCase();
      if (q) {
        const matchName = product.name.toLowerCase().includes(q);
        const matchNameAr = product.nameAr ? product.nameAr.includes(q) : false;
        const matchDesc = product.description.toLowerCase().includes(q);
        const matchColor = product.colors.some((c) =>
          c.name.toLowerCase().includes(q)
        );
        if (!matchName && !matchNameAr && !matchDesc && !matchColor) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-low') {
        return a.discountedPrice - b.discountedPrice;
      }
      if (filters.sortBy === 'price-high') {
        return b.discountedPrice - a.discountedPrice;
      }
      if (filters.sortBy === 'discount') {
        const discA = a.originalPrice - a.discountedPrice;
        const discB = b.originalPrice - b.discountedPrice;
        return discB - discA;
      }
      if (filters.sortBy === 'newest') {
        return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      }
      // featured / default: respect displayOrder
      return (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
    });
  }, [products, filters, searchQuery]);

  // Add Item to Cart
  const handleAddToCart = (
    product: Product,
    colorName: string,
    colorHex: string,
    size: string,
    quantity: number,
    image: string
  ) => {
    const cartId = `${product.id}-${colorName}-${size}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartId === cartId);
      if (existing) {
        return prev.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          cartId,
          productId: product.id,
          name: product.name,
          nameAr: product.nameAr || product.name,
          colorName,
          colorHex,
          size,
          price: product.discountedPrice,
          originalPrice: product.originalPrice,
          image,
          quantity,
          fit: product.fit,
          fitAr: product.fitAr || product.fit
        }
      ];
    });

    const itemName = isArabic && product.nameAr ? product.nameAr : product.name;
    showToast(isArabic ? `تمت إضافة "${itemName}" إلى الحقيبة` : `Added "${itemName}" to bag`);
  };

  // Add Complete Bundle Set to Cart
  const handleAddBundleToCart = (
    bundle: OutfitBundle,
    selections: Record<string, { colorId: string; size: string }>
  ) => {
    const included = bundle.productIds.map((id) => productsMap[id]).filter(Boolean);
    const bundleOriginalSum = included.reduce((s, p) => s + p.discountedPrice, 0) || bundle.originalPrice;
    const discountRatio = bundle.bundlePrice / bundleOriginalSum;

    included.forEach((product) => {
      const selection = selections[product.id] || {
        colorId: product.colors[0]?.id || '',
        size: product.sizes[0]?.size || 'L'
      };
      const activeColor = product.colors.find((c) => c.id === selection.colorId) || product.colors[0];
      const itemPrice = Math.round(product.discountedPrice * discountRatio);
      const cartId = `bundle-${bundle.id}-${product.id}-${activeColor.name}-${selection.size}`;

      setCartItems((prev) => {
        const existing = prev.find((item) => item.cartId === cartId);
        if (existing) {
          return prev.map((item) =>
            item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [
          ...prev,
          {
            cartId,
            productId: product.id,
            name: `${bundle.name} (${product.name})`,
            nameAr: `${bundle.nameAr} (${product.nameAr || product.name})`,
            colorName: activeColor.name,
            colorHex: activeColor.hex,
            size: selection.size,
            price: itemPrice,
            originalPrice: product.originalPrice,
            image: activeColor.images[0] || bundle.image,
            quantity: 1,
            fit: product.fit,
            fitAr: product.fitAr || product.fit
          }
        ];
      });
    });

    const bundleDisplayName = isArabic ? bundle.nameAr : bundle.name;
    showToast(isArabic ? `🎉 تم إضافة ${bundleDisplayName} بسعر العرض!` : `🎉 Added ${bundleDisplayName} set to bag!`);
    setIsCartOpen(true);
  };

  const handleQuickAdd = (product: Product, colorId: string) => {
    const activeColor = product.colors.find((c) => c.id === colorId) || product.colors[0];
    const firstInStockSize = product.sizes.find((s) => s.inStock)?.size || 'M';
    handleAddToCart(
      product,
      activeColor.name,
      activeColor.hex,
      firstInStockSize,
      1,
      activeColor.images[0]
    );
  };

  const handleUpdateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.cartId === cartId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setPromoCode('');
    setDiscountAmount(0);
  };

  const handleApplyPromo = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'SOTRA10') {
      const discount = Math.round(subtotal * 0.1);
      setPromoCode('SOTRA10');
      setDiscountAmount(discount);
      return { success: true, message: 'Code SOTRA10 applied! 10% discount added.' };
    }
    if (clean === 'SOTRA15') {
      const discount = Math.round(subtotal * 0.15);
      setPromoCode('SOTRA15');
      setDiscountAmount(discount);
      return { success: true, message: 'Code SOTRA15 applied! 15% discount added.' };
    }
    if (clean === 'WELCOME') {
      const discount = Math.min(subtotal, 100);
      setPromoCode('WELCOME');
      setDiscountAmount(discount);
      return { success: true, message: 'Code WELCOME applied! LE 100 discount added.' };
    }

    return { success: false, message: 'Invalid promo code. Try SOTRA10' };
  };

  const activeFilterCount =
    filters.sizes.length +
    filters.colors.length +
    (filters.onlyDiscounted ? 1 : 0) +
    (filters.onlyInStock ? 1 : 0);

  const resetFilters = () => {
    setFilters({
      category: 'all',
      fit: [],
      sizes: [],
      colors: [],
      minPrice: 0,
      maxPrice: 2000,
      sortBy: 'featured',
      searchQuery: '',
      onlyDiscounted: false,
      onlyInStock: false
    });
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleOpenBundleById = (bundleId: string) => {
    const foundBundle = bundles.find((b) => b.id === bundleId);
    if (foundBundle) {
      setActiveBundle(foundBundle);
    }
  };

  const handleSelectProductById = (productId: string) => {
    const prod = productsMap[productId] || products.find((p) => p.id === productId);
    if (prod) {
      setActiveProduct(prod);
      setActiveColorId(undefined);
    }
  };

  // Determine active navigation tab
  const activeNavTab: 'home' | 'new' | 'best' | 'categories' | 'sets' | 'all' = 
    activeCategoryView === 'sets'
      ? 'sets'
      : activeCategoryView === 'all'
      ? 'all'
      : activeCategoryView !== null
      ? 'categories'
      : 'home';

  const handleNavigateTab = (tab: 'home' | 'new' | 'best' | 'categories' | 'sets' | 'all') => {
    if (tab === 'home') {
      setActiveCategoryView(null);
      setSelectedCategory('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'new') {
      if (activeCategoryView !== null) {
        setActiveCategoryView(null);
      }
      setTimeout(() => {
        const el = document.getElementById('new-arrivals-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else if (tab === 'best') {
      if (activeCategoryView !== null) {
        setActiveCategoryView(null);
      }
      setTimeout(() => {
        const el = document.getElementById('best-sellers-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else if (tab === 'categories') {
      if (activeCategoryView !== null) {
        setActiveCategoryView(null);
      }
      setTimeout(() => {
        const el = document.getElementById('categories-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else if (tab === 'sets') {
      handleOpenCategory('sets');
    } else if (tab === 'all') {
      if (activeCategoryView !== null) {
        setActiveCategoryView(null);
      }
      setSelectedCategory('all');
      setTimeout(() => {
        const el = document.getElementById('all-products-catalog');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-neutral-950 text-white text-xs font-semibold px-4 py-2.5 rounded shadow-xl tracking-wide flex items-center space-x-2 rtl:space-x-reverse animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Active Unreceived Orders Alert Bar - Ringtone Plays Until Acknowledged */}
      {pendingAlarmOrders.length > 0 && (
        <div className="sticky top-0 z-50 bg-red-600 text-white px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-2 text-xs border-b border-red-700 animate-pulse">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-base">🔔</span>
            <span>
              {isArabic
                ? `وصل طلب جديد! (${pendingAlarmOrders.length} طلب بحاجة للمعاينة)`
                : `New incoming order! (${pendingAlarmOrders.length} unreceived)`}
            </span>
            <span className="text-red-200 text-[11px] hidden sm:inline font-normal">
              {isArabic ? 'النغمة مستمرة حتى استلام الطلب' : 'Ringtone loops until received'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReceiveAllOrders}
              className="px-3 py-1.5 bg-white text-red-700 hover:bg-neutral-100 font-black text-xs rounded transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isArabic ? 'استلام الطلب (إيقاف النغمة)' : 'Receive Order (Stop Ringtone)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAdminDashboardOpen(true)}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded transition cursor-pointer"
            >
              {isArabic ? 'معاينة الطلبات' : 'View Orders'}
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Bar */}
      <BroadcastBanner notification={notificationSettings} isArabic={isArabic} />

      {/* Primary Sticky Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenFilter={() => setIsFilterOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
        currency={currency}
        onChangeCurrency={setCurrency}
        isArabic={isArabic}
        onToggleLanguage={() => setIsArabic(!isArabic)}
        activeNavTab={activeNavTab}
        onNavigateTab={handleNavigateTab}
      />

      {/* Main Content: Either Dedicated Category View OR Complete Home Store View */}
      {activeCategoryView === 'sets' ? (
        <main className="flex-1">
          <div className="bg-neutral-950 text-white py-8 px-4 border-b border-neutral-800">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="text-xs text-neutral-400 hover:text-white mb-2 flex items-center space-x-1.5 rtl:space-x-reverse transition cursor-pointer"
                >
                  <span>{isArabic ? '← العودة للرئيسية' : '← Back to Home'}</span>
                </button>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  {isArabic ? 'تنسيقات وأطقم سوترة الكاملة' : 'Complete Outfit Sets & Bundles'}
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  {isArabic
                    ? 'وفر حتى 300 ج.م عند شراء الأطقم المتناسقة كقطعة واحدة مع إمكانية تحديد مقاس ولون كل قطعة'
                    : 'Save up to 300 LE with coordinated sets while customizing size and color for each item'}
                </p>
              </div>
            </div>
          </div>
          <BundlesSection
            bundles={bundles}
            productsMap={productsMap}
            onSelectBundle={(bundle) => setActiveBundle(bundle)}
            currency={currency}
            currencyRate={CURRENCY_RATES[currency]}
            isArabic={isArabic}
          />
        </main>
      ) : activeCategoryView !== null ? (
        <CategoryPage
          categoryKey={activeCategoryView}
          products={products}
          onBack={handleBackToHome}
          onSelectProduct={(p, colorId) => {
            setActiveProduct(p);
            setActiveColorId(colorId);
          }}
          onQuickAdd={handleQuickAdd}
          currency={currency}
          currencyRate={CURRENCY_RATES[currency]}
          isArabic={isArabic}
          categories={categories}
        />
      ) : (
        <main className="flex-1">
          {/* Main Home Store View - Starts directly from the 3-image Rotating Banner that features (وصل حديثاً | الأقسام | جميع المنتجات) */}
          <HomeStoreView
            products={products}
            filteredProducts={filteredProducts}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
            }}
            bundles={bundles}
            productsMap={productsMap}
            currency={currency}
            currencyRate={CURRENCY_RATES[currency]}
            onSelectProduct={(p, colorId) => {
              setActiveProduct(p);
              setActiveColorId(colorId);
            }}
            onQuickAdd={handleQuickAdd}
            onOpenBundleModal={(bundle) => setActiveBundle(bundle)}
            onOpenFilterDrawer={() => setIsFilterOpen(true)}
            activeFilterCount={activeFilterCount}
            onOpenCategory={(cat) => {
              handleOpenCategory(cat);
            }}
            onViewAllCategory={(cat) => {
              handleOpenCategory(cat);
            }}
            onOpenBundleById={handleOpenBundleById}
            categories={categories}
            shopByCategoryTiles={shopByCategoryTiles}
            isArabic={isArabic}
          />
        </main>
      )}

      {/* Floating Instant WhatsApp Button */}
      <FloatingWhatsApp isArabic={isArabic} />

      {/* Global Footer */}
      <Footer
        onOpenCategory={(cat) => {
          handleOpenCategory(cat);
        }}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
        isArabic={isArabic}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        subtotal={subtotal}
        discountAmount={discountAmount}
        promoCode={promoCode}
        onApplyPromo={handleApplyPromo}
        currency={currency}
        currencyRate={CURRENCY_RATES[currency]}
        isArabic={isArabic}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      {/* Fast Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        subtotal={subtotal}
        discountAmount={discountAmount}
        promoCode={promoCode}
        currency={currency}
        currencyRate={CURRENCY_RATES[currency]}
        onClearCart={handleClearCart}
        savedProfile={customerProfile}
        onSaveProfile={handleSaveCustomerProfile}
        onAddOrder={handleAddCustomerOrder}
        isArabic={isArabic}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={activeProduct}
        initialColorId={activeColorId}
        onClose={() => {
          setActiveProduct(null);
          setActiveColorId(undefined);
        }}
        onAddToCart={handleAddToCart}
        currency={currency}
        currencyRate={CURRENCY_RATES[currency]}
        isArabic={isArabic}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectProductById={handleSelectProductById}
      />

      {/* Coordinated Outfit Bundle Modal */}
      <BundleModal
        bundle={activeBundle}
        onClose={() => setActiveBundle(null)}
        productsMap={productsMap}
        onAddBundleToCart={handleAddBundleToCart}
        currency={currency}
        currencyRate={CURRENCY_RATES[currency]}
        isArabic={isArabic}
      />

      {/* Customer Profile & Address Book Modal */}
      <CustomerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={customerProfile}
        onSaveProfile={handleSaveCustomerProfile}
        orders={customerOrders}
        isArabic={isArabic}
      />

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onChangeFilters={setFilters}
        onResetFilters={resetFilters}
        totalResults={filteredProducts.length}
        isArabic={isArabic}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        products={products}
        onSelectProduct={(p: Product) => {
          setActiveProduct(p);
        }}
        currency={currency}
        currencyRate={CURRENCY_RATES[currency]}
        isArabic={isArabic}
      />

      {/* Drop Alerts / VIP Offers Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onApplyPromoCode={(code: string) => {
          handleApplyPromo(code);
          setIsCartOpen(true);
        }}
        onShopNewArrivals={() => {
          handleOpenCategory('tops');
        }}
        isArabic={isArabic}
      />

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onSelectCategory={(cat: any) => {
          handleOpenCategory(cat);
        }}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        currency={currency}
        onChangeCurrency={setCurrency}
        isArabic={isArabic}
        onToggleLanguage={() => setIsArabic(!isArabic)}
      />

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        isArabic={isArabic}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        orders={customerOrders}
        isArabic={isArabic}
        currency={currency}
        currencyRate={CURRENCY_RATES[currency]}
      />

      {/* Promo Popup Modal on Entrance */}
      <PromoPopupModal
        popup={promoSettings}
        isOpen={isPromoPopupOpen}
        onClose={() => setIsPromoPopupOpen(false)}
        onSelectProductById={(id: string) => {
          const found = products.find((p) => p.id === id);
          if (found) setActiveProduct(found);
        }}
        onOpenCategory={(cat: any) => handleOpenCategory(cat)}
        isArabic={isArabic}
      />

      {/* Admin Login Modal (Triggered by 10 clicks on SOTRA logo in footer) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminDashboardOpen(true);
        }}
        isArabic={isArabic}
      />

      {/* Admin Management Dashboard */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        onLogout={handleAdminLogout}
        products={products}
        onSaveProducts={handleSaveProducts}
        categories={categories}
        onSaveCategories={handleSaveCategories}
        bundles={bundles}
        onSaveBundles={handleSaveBundles}
        orders={customerOrders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateOrders={setCustomerOrders}
        onResetDefaults={handleResetDefaults}
        isArabic={isArabic}
      />
    </div>
  );
}
