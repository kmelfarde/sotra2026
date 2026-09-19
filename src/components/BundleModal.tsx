import React, { useState, useMemo } from 'react';
import { X, Check, ShoppingBag, Layers, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { OutfitBundle, Product, CurrencyCode } from '../types';

interface BundleModalProps {
  bundle: OutfitBundle | null;
  productsMap: Record<string, Product>;
  onClose: () => void;
  onAddBundleToCart: (bundle: OutfitBundle, selections: Record<string, { colorId: string; size: string }>) => void;
  onOpenSizeGuide?: () => void;
  currency: CurrencyCode;
  currencyRate: number;
  isArabic: boolean;
}

export const BundleModal: React.FC<BundleModalProps> = ({
  bundle,
  productsMap,
  onClose,
  onAddBundleToCart,
  currency,
  currencyRate,
  isArabic
}) => {
  if (!bundle) return null;

  const includedProducts = useMemo(() => {
    return bundle.productIds.map((id) => productsMap[id]).filter(Boolean);
  }, [bundle.productIds, productsMap]);

  // Selections state for each product in bundle: { [productId]: { colorId: string, size: string } }
  const [selections, setSelections] = useState<Record<string, { colorId: string; size: string }>>(() => {
    const initial: Record<string, { colorId: string; size: string }> = {};
    bundle.productIds.forEach((id) => {
      const prod = productsMap[id];
      if (prod) {
        const availableColor = prod.colors?.[0]?.id || '';
        const inStockSize = prod.sizes.find((s) => s.inStock)?.size || prod.sizes[0]?.size || 'L';
        initial[id] = { colorId: availableColor, size: inStockSize };
      }
    });
    return initial;
  });

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const formatPrice = (amount: number) => {
    const converted = amount * currencyRate;
    if (currency === 'EGP') return `LE ${amount.toFixed(2)}`;
    if (currency === 'USD') return `$${converted.toFixed(2)}`;
    if (currency === 'SAR') return `${converted.toFixed(2)} SAR`;
    return `${converted.toFixed(2)} AED`;
  };

  const handleColorChange = (productId: string, colorId: string) => {
    setSelections((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        colorId
      }
    }));
  };

  const handleSizeChange = (productId: string, size: string) => {
    setSelections((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        size
      }
    }));
  };

  const handleAddToCart = () => {
    onAddBundleToCart(bundle, selections);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 900);
  };

  const galleryImages = bundle.galleryImages?.length ? bundle.galleryImages : [bundle.image];
  const activeImage = galleryImages[activeGalleryIndex] || bundle.image;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-none shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="px-4 py-3 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black tracking-wider px-2 py-0.5 uppercase">
              {isArabic ? `طقم كامل بخصم ${bundle.discountPercent}%` : `COMPLETE SET • SAVE ${bundle.discountPercent}%`}
            </span>
            <span className="text-xs text-neutral-300 font-bold hidden sm:inline">
              {isArabic ? 'تنسيق واختيار مقاسات المنتجات' : 'Customize items in your outfit'}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column: Big Set Visual Preview & Gallery (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-3">
              <div className="relative aspect-[3/4] w-full bg-neutral-100 rounded-sm overflow-hidden border border-neutral-200">
                <img
                  src={activeImage}
                  alt={bundle.name}
                  className="w-full h-full object-cover object-center"
                />

                <div className="absolute top-3 left-3 bg-black/80 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider backdrop-blur-xs">
                  {isArabic ? 'صورة الطقم المتكامل' : 'Showcase Outfit Look'}
                </div>
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGalleryIndex(idx)}
                      className={`relative w-16 h-20 shrink-0 border overflow-hidden rounded-xs cursor-pointer transition ${
                        activeGalleryIndex === idx
                          ? 'border-neutral-900 ring-2 ring-neutral-900'
                          : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Perks Trust Badges */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-1.5 text-xs text-neutral-700 font-medium">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-black shrink-0" />
                  <span>{isArabic ? 'شحن سريع لجميع المحافظات خلال 24-48 ساعة' : 'Fast 24-48h delivery across Egypt'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-black shrink-0" />
                  <span>{isArabic ? 'معاينة واستبدال سهل للمقاس عند الاستلام' : '14 Days easy size exchange at your door'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                  <span>{isArabic ? 'دفع عند الاستلام أو انستاباي' : 'Cash on delivery & InstaPay accepted'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Customization of each product in the set (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-xs font-black text-red-600 uppercase tracking-widest block mb-1">
                    {isArabic ? 'تشكيلة الأطقم الحصرية' : 'EXCLUSIVE SOTRA SET'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-950 uppercase tracking-tight font-heading">
                    {isArabic ? bundle.nameAr : bundle.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                    {isArabic ? bundle.descriptionAr : bundle.description}
                  </p>

                  {/* Pricing Overview */}
                  <div className="mt-3 flex items-baseline space-x-3 bg-neutral-50 p-3 border border-neutral-200">
                    <span className="text-2xl font-black text-neutral-950">
                      {formatPrice(bundle.bundlePrice)}
                    </span>
                    <span className="text-sm font-bold text-neutral-400 line-through">
                      {formatPrice(bundle.originalPrice)}
                    </span>
                    <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      {isArabic ? `وفرت ${formatPrice(bundle.originalPrice - bundle.bundlePrice)}` : `Save ${formatPrice(bundle.originalPrice - bundle.bundlePrice)}`}
                    </span>
                  </div>
                </div>

                {/* Products Configurator Section */}
                <div className="space-y-4 pt-2 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center space-x-1.5">
                      <Layers className="w-4 h-4 text-black" />
                      <span>{isArabic ? 'تخصيص المقاسات والألوان لكل قطعة داخل الطقم:' : 'Select Size & Color for Each Product:'}</span>
                    </h3>
                  </div>

                  {includedProducts.map((product, idx) => {
                    const currentSelection = selections[product.id] || {
                      colorId: product.colors[0]?.id || '',
                      size: product.sizes[0]?.size || 'L'
                    };
                    const activeColorObj = product.colors.find((c) => c.id === currentSelection.colorId) || product.colors[0];

                    return (
                      <div
                        key={product.id}
                        className="bg-white border-2 border-neutral-200 p-3 sm:p-4 rounded-sm space-y-3 hover:border-neutral-900 transition-colors"
                      >
                        {/* Product Header */}
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-14 bg-neutral-100 rounded overflow-hidden shrink-0 border border-neutral-200">
                            <img
                              src={activeColorObj?.images?.[0] || product.colors[0]?.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                              {isArabic ? `القطعة رقم ${idx + 1}` : `Item 0${idx + 1}`}
                            </span>
                            <h4 className="text-xs sm:text-sm font-black uppercase text-neutral-900 break-words leading-tight">
                              {isArabic && product.nameAr ? product.nameAr : product.name}
                            </h4>
                            <span className="text-[11px] font-bold text-neutral-500">
                              {isArabic ? 'اللون:' : 'Color:'} {activeColorObj?.name} | {isArabic ? 'المقاس:' : 'Size:'} <strong className="text-black">{currentSelection.size}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Color Selector */}
                        {product.colors && product.colors.length > 0 && (
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                              {isArabic ? 'اختر لون هذه القطعة:' : 'Select Item Color:'}
                            </span>
                            <div className="flex items-center space-x-2">
                              {product.colors.map((color) => {
                                const isColorSelected = currentSelection.colorId === color.id;
                                return (
                                  <button
                                    key={color.id}
                                    type="button"
                                    onClick={() => handleColorChange(product.id, color.id)}
                                    title={color.name}
                                    className={`relative w-6 h-6 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer ${
                                      isColorSelected
                                        ? 'ring-2 ring-black ring-offset-2 scale-110'
                                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                                    }`}
                                    style={{
                                      backgroundColor: color.hex,
                                      border: color.borderHex ? `1.5px solid ${color.borderHex}` : '1px solid rgba(0,0,0,0.15)'
                                    }}
                                  >
                                    {isColorSelected && (
                                      <Check className={`w-3 h-3 ${color.hex === '#fafafa' || color.hex === '#ffffff' ? 'text-black' : 'text-white'}`} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Size Selector */}
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                            {isArabic ? 'اختر مقاس هذه القطعة:' : 'Select Item Size:'}
                          </span>
                          <div className="grid grid-cols-6 gap-1.5">
                            {product.sizes.map((s) => {
                              const isSelectedSize = currentSelection.size === s.size;
                              const inStock = s.inStock;
                              return (
                                <button
                                  key={s.size}
                                  type="button"
                                  disabled={!inStock}
                                  onClick={() => handleSizeChange(product.id, s.size)}
                                  className={`py-1.5 text-xs font-black uppercase transition-all duration-150 border cursor-pointer ${
                                    isSelectedSize
                                      ? 'bg-black text-white border-black shadow-xs'
                                      : inStock
                                      ? 'bg-white text-neutral-900 border-neutral-300 hover:border-black'
                                      : 'bg-neutral-100 text-neutral-300 border-neutral-200 cursor-not-allowed line-through'
                                  }`}
                                >
                                  {s.size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Bundle to Bag Action */}
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-neutral-950 hover:bg-neutral-800 text-white text-sm sm:text-base font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-xl hover:shadow-2xl cursor-pointer"
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>{isArabic ? 'تمت إضافة الطقم للحقيبة!' : 'Added Complete Set to Bag!'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>
                        {isArabic ? 'أضف الطقم بالكامل للحقيبة' : 'Add Complete Set to Bag'} • {formatPrice(bundle.bundlePrice)}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
