import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Layers,
  ArrowUpRight,
  Sparkles,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { Product, CurrencyCode, CategoryTab, OutfitBundle } from '../types';
import { ProductPromoBannerCard } from './ProductPromoBannerCard';

interface ProductModalProps {
  product: Product | null;
  initialColorId?: string;
  allProducts?: Product[];
  bundles?: OutfitBundle[];
  onSelectBundle?: (bundle: OutfitBundle) => void;
  onClose: () => void;
  onAddToCart: (product: Product, colorName: string, colorHex: string, size: string, quantity: number, image: string) => void;
  onOpenBundleModal?: (bundleId: string) => void;
  onSelectProductById?: (productId: string) => void;
  onOpenCategory?: (category: CategoryTab) => void;
  onOpenSizeGuide?: () => void;
  currency: CurrencyCode;
  currencyRate: number;
  isArabic: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  initialColorId,
  allProducts,
  bundles = [],
  onSelectBundle,
  onClose,
  onAddToCart,
  onOpenBundleModal,
  onSelectProductById,
  onOpenCategory,
  currency,
  currencyRate,
  isArabic
}) => {
  if (!product) return null;

  const initialColorIndex = initialColorId
    ? product.colors.findIndex((c) => c.id === initialColorId)
    : 0;

  const [selectedColorIdx, setSelectedColorIdx] = useState(
    initialColorIndex >= 0 ? initialColorIndex : 0
  );
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const firstInStock = product.sizes.find((s) => s.inStock);
    return firstInStock ? firstInStock.size : 'M';
  });
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [addedLookSuccess, setAddedLookSuccess] = useState(false);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [selectedOutfitImage, setSelectedOutfitImage] = useState<string | null>(null);

  const activeColor = product.colors[selectedColorIdx] || product.colors[0];
  const images = activeColor?.images || [];
  const currentImage = images[selectedImageIdx] || images[0];

  // Stock and size synchronization strictly per chosen color
  const activeColorSizesStock = activeColor?.sizesStock && activeColor.sizesStock.length > 0
    ? activeColor.sizesStock
    : null;

  // Auto-switch to available size if current selected size is out of stock in the active color
  useEffect(() => {
    if (activeColorSizesStock) {
      const currentStockItem = activeColorSizesStock.find((st) => st.size === selectedSize);
      if (!currentStockItem || currentStockItem.stockCount <= 0) {
        const firstAvailable = activeColorSizesStock.find((st) => st.stockCount > 0);
        if (firstAvailable) {
          setSelectedSize(firstAvailable.size);
        }
      }
    }
  }, [selectedColorIdx, activeColorSizesStock]);

  const formatPrice = (amount: number) => {
    const converted = amount * currencyRate;
    if (currency === 'EGP') return `LE ${amount.toFixed(2)}`;
    if (currency === 'USD') return `$${converted.toFixed(2)}`;
    if (currency === 'SAR') return `${converted.toFixed(2)} SAR`;
    return `${converted.toFixed(2)} AED`;
  };

  const handleColorChange = (idx: number) => {
    setSelectedColorIdx(idx);
    setSelectedImageIdx(0);
    const newColor = product.colors[idx];
    if (newColor?.sizesStock && newColor.sizesStock.length > 0) {
      const currentStock = newColor.sizesStock.find((st) => st.size === selectedSize);
      if (!currentStock || currentStock.stockCount <= 0) {
        const firstAvail = newColor.sizesStock.find((st) => st.stockCount > 0);
        if (firstAvail) {
          setSelectedSize(firstAvail.size);
        }
      }
    }
  };

  // Check current stock for selected color and size
  const currentColorStockItem = activeColor?.sizesStock?.find((st) => st.size === selectedSize);
  const currentSelectedStock = currentColorStockItem !== undefined
    ? currentColorStockItem.stockCount
    : (product.sizes.find((s) => s.size === selectedSize)?.stockCount ?? 0);
  const isSelectedSizeInStock = currentSelectedStock > 0;

  const handleAddToCart = () => {
    if (!isSelectedSizeInStock) return;
    onAddToCart(
      product,
      activeColor.name,
      activeColor.hex,
      selectedSize,
      quantity,
      currentImage
    );
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 1500);
  };

  // Strictly sync with database products
  const catalog = allProducts && allProducts.length > 0 ? allProducts : [];

  // 1. Explicit or Smart complementary product ("قطعة مكملة للإطلالة / منتج مكمل")
  const complementaryProduct = (() => {
    if (product.complementaryProductId) {
      const found = catalog.find((p) => p.id === product.complementaryProductId);
      if (found) return found;
    }
    // If product has a promo banner targeting a specific product, use that
    if (product.promoBanner?.targetType === 'product' && product.promoBanner?.targetId) {
      const targetId = product.promoBanner.targetId;
      const found = catalog.find((p) => p.id === targetId);
      if (found) return found;
    }
    // Cross-match with complementary category (tops <-> bottoms)
    if (catalog.length > 1) {
      const targetCat = product.category === 'tops' ? 'bottoms' : product.category === 'bottoms' ? 'tops' : 'accessories';
      const match = catalog.find((p) => p.id !== product.id && p.category === targetCat);
      if (match) return match;
      return catalog.find((p) => p.id !== product.id) || null;
    }
    return null;
  })();

  // 2. Coordinated Look Products configured by Admin in database ("تنسيقة الإطلالة المتكاملة")
  const completeTheLookProducts = (() => {
    if (product.coordinatedOutfitIds && product.coordinatedOutfitIds.length > 0) {
      const explicit = product.coordinatedOutfitIds
        .map((id) => catalog.find((p) => p.id === id))
        .filter(Boolean) as Product[];
      if (explicit.length > 0) return explicit;
    }
    // Intelligent fallback complementary pieces for seamless styling
    const otherProducts = catalog.filter((p) => p.id !== product.id);
    const targetCat = product.category === 'tops' ? 'bottoms' : product.category === 'bottoms' ? 'tops' : 'accessories';
    const primary = otherProducts.filter((p) => p.category === targetCat);
    const secondary = otherProducts.filter((p) => p.category !== targetCat);
    return [...primary, ...secondary].slice(0, 3);
  })();

  // 3. Matching & Complementary Outfit Bundles ("الأطقم المتكاملة المكملة")
  const matchingBundles = (() => {
    const linked = bundles.filter(
      (b) =>
        (b.productIds && b.productIds.includes(product.id)) ||
        (product.linkedBundleIds && product.linkedBundleIds.includes(b.id))
    );
    if (linked.length > 0) return linked;
    return bundles.slice(0, 3);
  })();

  const outfitImages = product.outfitImages || [];

  const lookTotal = completeTheLookProducts.reduce(
    (sum, p) => sum + (p.discountedPrice || p.originalPrice),
    0
  );

  const getItemRoleLabel = (item: Product) => {
    if (item.category === 'bottoms') {
      return isArabic ? 'القطعة السفلية المتناسقة' : 'Matching Bottoms';
    }
    if (item.category === 'tops') {
      return isArabic ? 'القطعة العلوية المتناسقة' : 'Matching Tops';
    }
    if (item.category === 'compressions') {
      return isArabic ? 'قطعة ضغط ستيلث' : 'Stealth Compression';
    }
    if (item.category === 'tanks') {
      return isArabic ? 'قطعة تانك كاجوال' : 'Casual Layer';
    }
    if (item.category === 'accessories') {
      return isArabic ? 'إكسسوار الإطلالة' : 'Style Essential';
    }
    return isArabic ? 'قطعة مكملة للإطلالة' : 'Matching Piece';
  };

  const handleAddCompleteLook = () => {
    completeTheLookProducts.forEach((item) => {
      const itemImg = item.colors[0]?.images[0] || '';
      onAddToCart(
        item,
        item.colors[0]?.name || 'Standard',
        item.colors[0]?.hex || '#000000',
        'M',
        1,
        itemImg
      );
    });
    setAddedLookSuccess(true);
    setTimeout(() => setAddedLookSuccess(false), 1600);
  };

  const handleAddSingleLookItem = (item: Product) => {
    const itemImg = item.colors[0]?.images[0] || '';
    onAddToCart(
      item,
      item.colors[0]?.name || 'Standard',
      item.colors[0]?.hex || '#000000',
      'M',
      1,
      itemImg
    );
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 1600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:rounded-none overflow-y-auto shadow-2xl flex flex-col no-scrollbar"
        id="product-page-container"
      >
        {/* Top Header / Bar inside Modal */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition cursor-pointer flex items-center space-x-1 rtl:space-x-reverse"
            aria-label="Back / Close"
          >
            {isArabic ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
              {isArabic ? 'رجوع للمتجر' : 'Back to Store'}
            </span>
          </button>

          <span className="font-heading font-black text-lg tracking-widest uppercase text-black">
            SOTRA
          </span>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 text-neutral-700 hover:text-red-600 transition cursor-pointer"
              title="Save to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-full transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Main Content Layout: Two Columns on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 p-4 sm:p-6 md:p-8">
          
          {/* Left Column: Full-Length Complete Product Photo & Gallery */}
          <div className="flex flex-col space-y-3">
            {/* Main Image Container: Full vertical frame */}
            <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] bg-neutral-100 overflow-hidden flex items-center justify-center border border-neutral-200 group">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />

              {/* Status Badge (RESTOCKED / HOT / DISCOUNT) */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                {product.badge && (
                  <span className="bg-black text-white text-[10px] sm:text-xs font-black tracking-widest px-2.5 py-1 uppercase shadow-md">
                    {product.badge === 'RESTOCKED' 
                      ? (isArabic ? 'تمت إعادة التوفر' : 'RESTOCKED')
                      : product.badge === 'NEW'
                      ? (isArabic ? 'وصل حديثاً' : 'NEW')
                      : (isArabic ? 'الأكثر طلباً' : 'HOT')}
                  </span>
                )}
                {product.discountPercent && product.discountPercent > 0 && (
                  <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black tracking-widest px-2.5 py-1 uppercase shadow-md">
                    {product.discountPercent}% {isArabic ? 'خصم' : 'OFF'}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails Gallery */}
            {images.length > 1 && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse overflow-x-auto no-scrollbar pb-1 pt-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-16 sm:w-20 aspect-[3/4] shrink-0 bg-neutral-100 overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIdx === idx 
                        ? 'border-black ring-1 ring-black opacity-100' 
                        : 'border-neutral-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Title, Fit, Price, Customization & Look */}
          <div className="flex flex-col justify-between pt-4 sm:pt-0">
            <div>
              {/* Badge Tag */}
              <div className="inline-block bg-neutral-100 text-neutral-800 border border-neutral-300 text-[10px] font-black tracking-widest px-2 py-0.5 uppercase mb-2">
                {product.badge === 'RESTOCKED'
                  ? (isArabic ? 'إعادة توفر • RESTOCKED' : 'RESTOCKED')
                  : (isArabic ? 'إصدار مميز' : 'OFFICIAL SOTRA')}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 uppercase mb-3 font-heading leading-tight">
                {isArabic && product.nameAr ? product.nameAr : product.name}
              </h1>

              {/* Price Row (Without Ratings) */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
                <div className="flex items-baseline space-x-2.5 rtl:space-x-reverse">
                  {product.discountedPrice < product.originalPrice ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-black text-neutral-950">
                        {formatPrice(product.discountedPrice)}
                      </span>
                      <span className="text-sm sm:text-base text-neutral-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-neutral-950">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* COLOR Selection with Color Name & Swatch Previews */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2.5">
                  <span className="text-neutral-900">
                    {isArabic ? 'اللون:' : 'COLOR'} <span className="text-neutral-900 font-black">{activeColor.name}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  {product.colors.map((c, idx) => {
                    const isSelected = selectedColorIdx === idx;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleColorChange(idx)}
                        className={`group relative flex flex-col items-center cursor-pointer transition-all ${
                          isSelected ? 'scale-105' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm transition ${
                            isSelected ? 'ring-2 ring-black ring-offset-2 border-white' : 'border-neutral-300'
                          }`}
                          style={{
                            backgroundColor: c.hex,
                            borderColor: c.borderHex || 'rgba(0,0,0,0.2)'
                          }}
                        >
                          {isSelected && (
                            <Check
                              className={`w-4 h-4 ${
                                c.hex === '#ffffff' || c.hex === '#fafafa' ? 'text-black' : 'text-white'
                              }`}
                            />
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-neutral-600 mt-1 max-w-[60px] truncate text-center">
                          {c.name.split('/')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SIZE Selection */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="text-neutral-900">
                    {isArabic ? 'المقاس:' : 'SIZE'} <span className="text-black font-extrabold">{selectedSize}</span>
                  </span>
                  {/* Dynamic stock indicator for chosen color & size: only show count when exactly 1 piece remains */}
                  {(() => {
                    const colorStockItem = activeColor?.sizesStock?.find((st) => st.size === selectedSize);
                    const currentStock = colorStockItem !== undefined 
                      ? colorStockItem.stockCount 
                      : (product.sizes.find((s) => s.size === selectedSize)?.stockCount ?? 0);
                    if (currentStock <= 0) {
                      return <span className="text-red-600 font-bold text-[11px]">{isArabic ? 'غير متوفر بهذا اللون' : 'Out of Stock in this color'}</span>;
                    } else if (currentStock === 1) {
                      return <span className="text-amber-600 font-bold text-[11px]">{isArabic ? 'آخر قطعة!' : 'Last piece!'}</span>;
                    }
                    return <span className="text-green-700 font-bold text-[11px]">{isArabic ? 'متوفر' : 'In Stock'}</span>;
                  })()}
                </div>

                {/* Size Buttons Row */}
                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((s) => {
                    const isSelected = selectedSize === s.size;
                    const colorStockItem = activeColor?.sizesStock?.find((st) => st.size === s.size);
                    const hasColorStock = colorStockItem !== undefined;
                    const stockCount = hasColorStock ? colorStockItem.stockCount : s.stockCount;
                    const sizeInStock = stockCount > 0;

                    return (
                      <button
                        key={s.size}
                        disabled={!sizeInStock}
                        onClick={() => setSelectedSize(s.size)}
                        title={`${s.size} - ${stockCount === 1 ? (isArabic ? 'آخر قطعة!' : 'Last piece!') : (sizeInStock ? (isArabic ? 'متوفر' : 'In Stock') : (isArabic ? 'غير متوفر بهذا اللون' : 'Out of Stock'))}`}
                        className={`py-3 text-xs sm:text-sm font-black tracking-wider uppercase transition-all duration-150 cursor-pointer border relative ${
                          !sizeInStock
                            ? 'bg-neutral-100 text-neutral-300 border-neutral-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-white text-black border-neutral-300 hover:border-black'
                        }`}
                      >
                        {s.size}
                        {stockCount === 1 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] px-1 rounded-full font-bold">
                            1
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper & Big Action Button */}
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                <div className="flex items-center border-2 border-neutral-300 bg-neutral-50 h-12">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 h-full text-neutral-800 hover:bg-neutral-200 font-bold text-sm cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 h-full flex items-center justify-center text-sm font-black text-black min-w-[36px]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 h-full text-neutral-800 hover:bg-neutral-200 font-bold text-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!isSelectedSizeInStock}
                  className={`flex-1 h-12 px-6 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-200 shadow-xl flex items-center justify-center space-x-2 rtl:space-x-reverse ${
                    !isSelectedSizeInStock
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      : addedSuccess
                      ? 'bg-green-600 text-white cursor-pointer'
                      : 'bg-black hover:bg-neutral-800 text-white cursor-pointer'
                  }`}
                >
                  {!isSelectedSizeInStock ? (
                    <span>{isArabic ? 'غير متوفر بهذا اللون' : 'OUT OF STOCK IN THIS COLOR'}</span>
                  ) : addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{isArabic ? 'تمت الإضافة للحقيبة بنجاح!' : 'ADDED TO BAG!'}</span>
                    </>
                  ) : (
                    <span>
                      {isArabic ? 'أضف للحقيبة' : 'ADD TO BAG'} • {formatPrice(product.discountedPrice * quantity)}
                    </span>
                  )}
                </button>
              </div>

              {/* Special Promotion / Matching Outfit Banner - Complementary Product Ad */}
              {product.promoBanner && (
                <div className="mb-6 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900">
                        {isArabic ? 'منتج مكمل للإطلالة وعرض حصري' : 'Complementary Match & Special Offer'}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-bold">
                      {isArabic ? 'إعلان مكمل' : 'Sponsored Pair'}
                    </span>
                  </div>
                  <ProductPromoBannerCard
                    banner={product.promoBanner}
                    onOpenBundleModal={(bId) => {
                      onClose();
                      if (onOpenBundleModal) onOpenBundleModal(bId);
                    }}
                    onSelectProductById={(pId) => {
                      onClose();
                      if (onSelectProductById) onSelectProductById(pId);
                    }}
                    onOpenCategory={(cat) => {
                      onClose();
                      if (onOpenCategory) onOpenCategory(cat);
                    }}
                    isArabic={isArabic}
                    variant="modal-featured"
                  />
                </div>
              )}

              {/* DEDICATED COMPLEMENTARY PRODUCT HIGHLIGHT ("قطعة مكملة للإطلالة") */}
              {complementaryProduct && (
                <div className="mt-7 p-3.5 sm:p-4 rounded-lg bg-neutral-900 text-white border border-neutral-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                        {isArabic ? 'قطعة مكملة للإطلالة' : 'RECOMMENDED COMPLEMENTARY PIECE'}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {isArabic ? 'أكمل أناقتك' : 'Style Pairing'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3.5 rtl:space-x-reverse">
                    <img
                      src={complementaryProduct.colors[0]?.images[0] || ''}
                      alt={complementaryProduct.name}
                      className="w-14 h-16 sm:w-16 sm:h-20 object-cover rounded bg-neutral-800 shrink-0 border border-neutral-700 cursor-pointer"
                      onClick={() => {
                        if (onSelectProductById) onSelectProductById(complementaryProduct.id);
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        onClick={() => {
                          if (onSelectProductById) onSelectProductById(complementaryProduct.id);
                        }}
                        className="font-bold text-xs sm:text-sm text-white truncate hover:underline cursor-pointer"
                      >
                        {isArabic && complementaryProduct.nameAr
                          ? complementaryProduct.nameAr
                          : complementaryProduct.name}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                        {isArabic
                          ? 'مصممة لتتناسق بشكل رائع ومثالي مع هذه القطعة'
                          : 'Designed to match perfectly with this item'}
                      </p>
                      <div className="mt-1 font-mono font-bold text-xs text-white">
                        {formatPrice(complementaryProduct.discountedPrice || complementaryProduct.originalPrice)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const compImg = complementaryProduct.colors[0]?.images[0] || '';
                        onAddToCart(
                          complementaryProduct,
                          complementaryProduct.colors[0]?.name || 'Standard',
                          complementaryProduct.colors[0]?.hex || '#000000',
                          'M',
                          1,
                          compImg
                        );
                        setAddedItemId(complementaryProduct.id);
                        setTimeout(() => setAddedItemId(null), 1200);
                      }}
                      className="px-3 py-2 bg-white hover:bg-neutral-200 text-black text-[11px] font-black uppercase rounded shrink-0 transition cursor-pointer shadow-sm"
                    >
                      {addedItemId === complementaryProduct.id
                        ? isArabic
                          ? 'تمت الإضافة ✓'
                          : 'Added ✓'
                        : isArabic
                        ? '+ إضافة المكملة'
                        : '+ Add Piece'}
                    </button>
                  </div>
                </div>
              )}

              {/* End of product details */}
            </div>
          </div>

          {/* ========================================================= */}
          {/* FULL-WIDTH COMPLEMENTARY OUTFITS & LOOKS SECTION AT BOTTOM */}
          {/* ("أظهر الأطقم المكمله أسفل المنتج بصفحة المنتج") */}
          {/* ========================================================= */}
          {/* SECTION: الأطقم المكملة فقط بصفحة المنتج */}
          {/* ========================================================= */}
          {matchingBundles.length > 0 && (
            <div className="border-t border-neutral-200 bg-neutral-50/60 p-4 sm:p-6 md:p-8 space-y-6">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-2">
                <div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                    <span className="w-2 h-2 rounded-full bg-black"></span>
                    <span className="text-[11px] font-black uppercase tracking-widest text-neutral-500">
                      {isArabic ? 'تنسيقات متناسقة' : 'MATCHED SETS'}
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-lg sm:text-xl uppercase tracking-wider text-neutral-950">
                    {isArabic ? 'الأطقم المكملة لهذا المنتج' : 'COMPLEMENTARY OUTFIT SETS'}
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-white text-neutral-800 rounded-full border border-neutral-200 self-start sm:self-auto">
                  {matchingBundles.length} {isArabic ? 'أطقم متاحة' : 'Sets Available'}
                </span>
              </div>

              {/* Complementary Outfit Bundles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingBundles.map((bundle) => {
                  const savings = bundle.originalPrice - bundle.bundlePrice;
                  const title = isArabic ? bundle.nameAr || bundle.name : bundle.name || bundle.nameAr;
                  const tagline = isArabic ? bundle.taglineAr || bundle.tagline : bundle.tagline || bundle.taglineAr;
                  const description = isArabic ? bundle.descriptionAr || bundle.description : bundle.description || bundle.descriptionAr;

                  return (
                    <div
                      key={bundle.id}
                      className="flex flex-col sm:flex-row bg-white rounded-xl border border-neutral-200 hover:border-black transition overflow-hidden shadow-xs hover:shadow-md"
                    >
                      {/* Bundle Image */}
                      <div className="relative sm:w-2/5 aspect-[4/5] sm:aspect-auto bg-neutral-100 shrink-0">
                        <img
                          src={bundle.image}
                          alt={title || 'Outfit'}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex flex-col gap-1">
                          {bundle.discountPercent > 0 && (
                            <span className="px-2 py-1 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded shadow-xs">
                              {isArabic ? `وفر ${bundle.discountPercent}%` : `${bundle.discountPercent}% OFF`}
                            </span>
                          )}
                          {bundle.badge && (
                            <span className="px-2 py-0.5 bg-white/95 text-neutral-950 text-[9px] font-black uppercase tracking-wider rounded shadow-xs">
                              {isArabic && bundle.badgeAr ? bundle.badgeAr : bundle.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bundle Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            {tagline ? (
                              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                                {tagline}
                              </span>
                            ) : (
                              <span />
                            )}
                            {savings > 0 && (
                              <span className="text-[10px] font-black text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                                {isArabic ? `وفر ${formatPrice(savings)}` : `Save ${formatPrice(savings)}`}
                              </span>
                            )}
                          </div>

                          <h5 className="font-heading font-black text-base text-neutral-950 mb-1.5">
                            {title}
                          </h5>

                          {description ? (
                            <p className="text-xs text-neutral-600 line-clamp-2 mb-3 leading-relaxed">
                              {description}
                            </p>
                          ) : null}

                          {/* Included pieces count */}
                          {bundle.productIds && bundle.productIds.length > 0 && (
                            <div className="text-[11px] text-neutral-700 font-semibold mb-3 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-neutral-500" />
                              <span>
                                {isArabic
                                  ? `يتكون الطقم من ${bundle.productIds.length} قطع متناسقة`
                                  : `Includes ${bundle.productIds.length} coordinated pieces`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Pricing & CTA */}
                        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
                              <span className="font-heading font-black text-base text-neutral-950">
                                {formatPrice(bundle.bundlePrice)}
                              </span>
                              {bundle.originalPrice > bundle.bundlePrice && (
                                <span className="text-xs text-neutral-400 line-through">
                                  {formatPrice(bundle.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (onSelectBundle) {
                                onSelectBundle(bundle);
                              } else if (onOpenBundleModal) {
                                onOpenBundleModal(bundle.id);
                              }
                            }}
                            className="px-3.5 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-sm"
                          >
                            <span>{isArabic ? 'تخصيص وطلب الطقم' : 'Shop Set'}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-270" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Outfit Image Lightbox Modal */}
        {selectedOutfitImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedOutfitImage(null)}
          >
            <div className="relative max-w-2xl max-h-[90vh] bg-black rounded-lg overflow-hidden border border-neutral-800" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setSelectedOutfitImage(null)}
                className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer transition border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedOutfitImage}
                alt="Enlarged Outfit"
                className="max-h-[85vh] w-auto mx-auto object-contain"
              />
              <div className="p-3 bg-neutral-950 text-center border-t border-neutral-800">
                <span className="text-xs font-bold text-neutral-300">
                  {isArabic ? 'تنسيقة طقم سوترة المتكاملة' : 'SOTRA Coordinated Outfit Styling'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

