import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, User, ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCw, X } from 'lucide-react';
import { CurrencyCode, CategoryTab } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenMenu?: () => void;
  onOpenMobileMenu?: () => void;
  onOpenSearch: () => void;
  onOpenFilter?: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenOrderTracking?: () => void;
  currency: CurrencyCode;
  onChangeCurrency: (c: CurrencyCode) => void;
  isArabic: boolean;
  onToggleLanguage: () => void;
  onGoHome?: () => void;
  activeNavTab?: 'home' | 'new' | 'best' | 'categories' | 'sets' | 'all';
  onNavigateTab?: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenMenu,
  onOpenMobileMenu,
  onOpenSearch,
  onOpenFilter,
  onOpenNotifications,
  onOpenProfile,
  onOpenOrderTracking,
  currency,
  onChangeCurrency,
  isArabic,
  onToggleLanguage,
  onGoHome,
  activeNavTab = 'home',
  onNavigateTab
}) => {
  const handleOpenMenu = onOpenMenu || onOpenMobileMenu || (() => {});
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const announcements = [
    { text: 'GUARANTEED RETURNS & EXCHANGES WITHIN 14 DAYS!', textAr: 'استبدال واسترجاع مضمون خلال 14 يوم!', icon: RefreshCw },
    { text: 'FREE EXPRESS SHIPPING ON ORDERS OVER LE 1000', textAr: 'شحن سريع مجاني للطلبات أكثر من 1000 جنيه', icon: Truck },
    { text: 'CASH ON DELIVERY & INSTAPAY AVAILABLE', textAr: 'الدفع عند الاستلام وانستاباي متاح بجميع المحافظات', icon: ShieldCheck }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Scrolling down -> hide header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up -> show header
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { id: 'home' as const, label: 'Home', labelAr: 'الرئيسية' },
    { id: 'new' as const, label: 'New Arrivals', labelAr: 'وصل حديثاً' },
    { id: 'best' as const, label: 'Best Sellers', labelAr: 'الأكثر مبيعاً' },
    { id: 'categories' as const, label: 'Categories', labelAr: 'الأقسام' },
    { id: 'sets' as const, label: 'Outfit Sets', labelAr: 'الأطقم والتنسيقات', highlight: true },
    { id: 'all' as const, label: 'All Products', labelAr: 'كل المنتجات' }
  ];

  return (
    <header className={`sticky top-0 z-40 w-full bg-white border-b border-neutral-200 shadow-xs transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      {/* Top Announcement Bar */}
      <div className="bg-black text-white text-xs font-semibold py-2 px-3 tracking-wider transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="w-full flex items-center justify-center space-x-2 space-x-reverse text-center">
            {React.createElement(announcements[tickerIndex].icon, { className: 'w-3.5 h-3.5 text-neutral-300 shrink-0 inline' })}
            <span className="uppercase text-[11px] sm:text-xs font-bold tracking-widest transition-opacity duration-300">
              {isArabic ? announcements[tickerIndex].textAr : announcements[tickerIndex].text}
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-3 text-[11px] shrink-0">
            <button 
              onClick={onToggleLanguage} 
              className="hover:text-neutral-300 px-1 py-0.5 rounded cursor-pointer transition font-medium"
            >
              {isArabic ? 'English' : 'عربي'}
            </button>
            <span className="text-neutral-600">|</span>
            <select
              value={currency}
              onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent text-white border-none focus:outline-none cursor-pointer text-[11px] font-semibold"
            >
              <option value="EGP" className="text-black">EGP (LE)</option>
              <option value="USD" className="text-black">USD ($)</option>
              <option value="SAR" className="text-black">SAR (ر.س)</option>
              <option value="AED" className="text-black">AED (د.إ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Action Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 sm:h-16 flex items-center justify-between">
        {/* Left Side: Hamburger & Search & Notification Bell */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          <button
            onClick={handleOpenMenu}
            aria-label="Open Navigation Menu"
            className="p-1.5 -ml-1 text-neutral-900 hover:text-black hover:bg-neutral-100 rounded-md transition cursor-pointer"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </button>

          <button
            onClick={onOpenSearch}
            aria-label="Search Catalog"
            className="p-1.5 text-neutral-900 hover:text-black hover:bg-neutral-100 rounded-md transition cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[2]" />
          </button>

          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="relative p-1.5 text-neutral-900 hover:text-black hover:bg-neutral-100 rounded-md transition cursor-pointer"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
            <span className="absolute top-1 right-1 flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-600 text-white text-[8px] sm:text-[9px] font-black rounded-full ring-2 ring-white">
              3
            </span>
          </button>
        </div>

        {/* Center: Brand Logo */}
        <div className="flex flex-col items-center justify-center cursor-pointer select-none">
          <button
            onClick={onGoHome}
            className="flex flex-col items-center text-center group cursor-pointer focus:outline-none"
          >
            <span className="font-black text-2xl sm:text-3xl tracking-[0.25em] text-neutral-950 uppercase font-stencil transition-transform group-hover:scale-105">
              SOTRA
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.35em] text-neutral-500 -mt-1 font-sans">
              fashion
            </span>
          </button>
        </div>

        {/* Right Side: Language Pill, Account & Cart Bag */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onToggleLanguage}
            title={isArabic ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
            className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold bg-neutral-100 hover:bg-black hover:text-white rounded transition cursor-pointer border border-neutral-200"
          >
            <span>{isArabic ? 'EN' : 'عربي'}</span>
          </button>

          <button
            onClick={onOpenProfile}
            aria-label="Customer Account"
            className="p-1.5 text-neutral-900 hover:text-black hover:bg-neutral-100 rounded-md transition cursor-pointer"
          >
            <User className="w-5 h-5 stroke-[2]" />
          </button>

          <button
            onClick={onOpenCart}
            aria-label="Shopping Cart"
            className="relative p-1.5 text-neutral-900 hover:text-black hover:bg-neutral-100 rounded-md transition cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[17px] h-[17px] px-1 bg-black text-white text-[9px] font-bold rounded-full ring-2 ring-white animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* End of Header Main Content */}
    </header>
  );
};
