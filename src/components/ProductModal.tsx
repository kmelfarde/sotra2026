import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ChevronDown, 
  ArrowRight, 
  ArrowLeft,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Product, CurrencyCode, CategoryTab } from '../types';
import { ProductPromoBannerCard } from './ProductPromoBannerCard';
import { PRODUCTS } from '../data/products';

interface ProductModalProps {
  product: Product | null;
  initialColorId?: string;
  allProducts?: Product[];
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
  const [activeAccordion, setActiveAccordion] = useState<string | null>('features');
  const [showFullFeatures, setShowFullFeatures] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [addedLookSuccess, setAddedLookSuccess] = useState(false);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  const activeColor = product.colors[selectedColorIdx] || product.colors[0];
  const images = activeColor?.images || [];
  const currentImage = images[selectedImageIdx] || images[0];

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
  };

  const handleAddToCart = () => {
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

  const catalog = allProducts && allProducts.length > 0 ? allProducts : PRODUCTS;

  // 1. Explicit complementary product configured by Admin ("قطعة مكملة للإطلالة")
  const complementaryProduct = product.complementaryProductId
    ? catalog.find((p) => p.id === product.complementaryProductId)
    : null;

  // 2. Coordinated Look Products configured by Admin or smart fallback
  const completeTheLookProducts = (() => {
    if (product.coordinatedOutfitIds && product.coordinatedOutfitIds.length > 0) {
      const explicit = product.coordinatedOutfitIds
        .map((id) => catalog.find((p) => p.id === id))
        .filter(Boolean) as Product[];
      if (explicit.length > 0) return explicit;
    }
    return catalog.filter(
      (p) => p.id !== product.id && (p.category !== product.category || p.badge === 'HOT')
    ).slice(0, 3);
  })();

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

              {/* FEATURES summary line with 'Learn more' link */}
              <div className="mb-5 bg-neutral-50 border border-neutral-200 p-3 rounded text-xs text-neutral-700">
                <div className="leading-relaxed">
                  <strong className="text-neutral-950 font-black uppercase tracking-wider mr-1.5 rtl:ml-1.5">
                    {isArabic ? 'المواصفات:' : 'FEATURES •'}
                  </strong>
                  <span>
                    {isArabic && product.featuresAr 
                      ? product.featuresAr.slice(0, 2).join(' • ')
                      : product.features.slice(0, 2).join(' • ')}
                  </span>
                  {showFullFeatures && (
                    <div className="mt-2 pt-2 border-t border-neutral-200 space-y-1 text-neutral-600">
                      {((isArabic && product.featuresAr) ? product.featuresAr : product.features).map((feat, i) => (
                        <div key={i} className="flex items-center space-x-1.5 rtl:space-x-reverse">
                          <span className="w-1 h-1 bg-black rounded-full" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullFeatures(!showFullFeatures)}
                  className="mt-1 text-black font-bold underline text-[11px] uppercase tracking-wider cursor-pointer inline-block"
                >
                  {showFullFeatures 
                    ? (isArabic ? 'عرض أقل' : 'Show less') 
                    : (isArabic ? 'اعرف المزيد' : 'Learn more')}
                </button>
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
                      return <span className="text-amber-600 font-bold text-[11px]">{isArabic ? 'متبقي قطعة واحدة فقط!' : 'Only 1 left in stock!'}</span>;
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
                    const sizeInStock = hasColorStock ? colorStockItem.stockCount > 0 : s.inStock;
                    const stockCount = hasColorStock ? colorStockItem.stockCount : s.stockCount;

                    return (
                      <button
                        key={s.size}
                        disabled={!sizeInStock}
                        onClick={() => setSelectedSize(s.size)}
                        title={`${s.size} - ${stockCount === 1 ? (isArabic ? 'متبقي قطعة واحدة' : 'Only 1 left') : (sizeInStock ? (isArabic ? 'متوفر' : 'In Stock') : (isArabic ? 'غير متوفر' : 'Out of Stock'))}`}
                        className={`py-3 text-xs sm:text-sm font-black tracking-wider uppercase transition-all duration-150 cursor-pointer border relative ${
                          !sizeInStock
                            ? 'bg-neutral-100 text-neutral-300 border-neutral-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-white text-black border-neutral-300 hover:border-black'
                        }`}
                      >
                        {s.size}
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
                  className={`flex-1 h-12 px-6 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-200 shadow-xl cursor-pointer flex items-center justify-center space-x-2 rtl:space-x-reverse ${
                    addedSuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-black hover:bg-neutral-800 text-white'
                  }`}
                >
                  {addedSuccess ? (
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

              {/* Special Promotion / Matching Outfit Banner (ولا تنسي الاعلان) */}
              {product.promoBanner && (
                <div className="mb-6">
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

              {/* BRAND NEW REDESIGNED "COMPLETE THE LOOK" OUTFIT STUDIO */}
              {completeTheLookProducts.length > 0 && (
                <div className="mt-8 pt-6 border-t border-neutral-200">
                  {/* Look Studio Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
                    <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Layers className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <h3 className="font-heading font-black text-sm sm:text-base uppercase tracking-wider text-neutral-950">
                            {isArabic ? 'تنسيقة الإطلالة المتكاملة' : 'COMPLETE THE LOOK'}
                          </h3>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-neutral-100 text-neutral-800 rounded border border-neutral-300">
                            {isArabic ? 'مظهر متناسق' : 'Curated Outfit'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {isArabic
                            ? 'قطع منتقاة بعناية لتكتمل بها أناقة المظهر وطابعك اليومي'
                            : 'Handpicked pieces styled to pair seamlessly with this drop'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCompleteLook}
                      className={`px-3.5 py-2 text-[11px] font-black uppercase rounded transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse cursor-pointer shadow-sm ${
                        addedLookSuccess
                          ? 'bg-green-600 text-white'
                          : 'bg-black hover:bg-neutral-800 text-white'
                      }`}
                    >
                      {addedLookSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>{isArabic ? 'تمت إضافة الإطلالة بالكامل!' : 'Full Outfit Added!'}</span>
                        </>
                      ) : (
                        <>
                          <Layers className="w-3.5 h-3.5" />
                          <span>
                            {isArabic
                              ? `أضف الإطلالة كاملة (${formatPrice(lookTotal)})`
                              : `Add Complete Look (${formatPrice(lookTotal)})`}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Look Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {completeTheLookProducts.map((item) => {
                      const itemImg = item.colors[0]?.images[0] || '';
                      const isItemAdded = addedItemId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="group relative bg-neutral-50 border border-neutral-200 hover:border-black rounded-md overflow-hidden transition-all duration-200 p-2.5 flex flex-col justify-between"
                        >
                          <div
                            onClick={() => {
                              if (onSelectProductById) {
                                onSelectProductById(item.id);
                              }
                            }}
                            className="cursor-pointer"
                          >
                            {/* Role Label */}
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-white border border-neutral-200 rounded text-neutral-700">
                                {getItemRoleLabel(item)}
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition" />
                            </div>

                            {/* Image Showcase with Hover Zoom */}
                            <div className="relative aspect-[3/4] bg-white rounded overflow-hidden mb-2 border border-neutral-100">
                              <img
                                src={itemImg}
                                alt={item.name}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Product Title and Price */}
                            <h4 className="text-xs font-bold text-neutral-900 break-words leading-tight uppercase group-hover:text-black transition">
                              {isArabic && item.nameAr ? item.nameAr : item.name}
                            </h4>
                          </div>

                          <div className="mt-2 pt-2 border-t border-neutral-200/80 flex items-center justify-between">
                            <span className="text-xs font-black text-neutral-950 font-mono">
                              {formatPrice(item.discountedPrice || item.originalPrice)}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(
                                  item,
                                  item.colors[0]?.name || 'Standard',
                                  item.colors[0]?.hex || '#000000',
                                  'M',
                                  1,
                                  itemImg
                                );
                                setAddedItemId(item.id);
                                setTimeout(() => setAddedItemId(null), 1200);
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1 rtl:space-x-reverse transition cursor-pointer ${
                                isItemAdded
                                  ? 'bg-green-600 text-white'
                                  : 'bg-white border border-neutral-300 hover:bg-black hover:text-white text-neutral-900 shadow-xs'
                              }`}
                              title="Add item to bag"
                            >
                              {isItemAdded ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>{isArabic ? 'أضيف' : 'Added'}</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>{isArabic ? 'أضف' : 'Add'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Accordions: Fabric, Features, Return Policy */}
              <div className="mt-8 border-t border-neutral-200 pt-3 text-xs">
                {/* Features Accordion */}
                <div className="border-b border-neutral-200 py-3">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'features' ? null : 'features')}
                    className="w-full flex items-center justify-between font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
                  >
                    <span>{isArabic ? 'المواصفات ومميزات التصميم' : 'Key Engineering & Features'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'features' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeAccordion === 'features' && (
                    <ul className="mt-2.5 space-y-1.5 text-neutral-600 list-disc list-inside">
                      {((isArabic && product.featuresAr) ? product.featuresAr : product.features).map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Fabric Accordion */}
                <div className="border-b border-neutral-200 py-3">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'fabric' ? null : 'fabric')}
                    className="w-full flex items-center justify-between font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
                  >
                    <span>{isArabic ? 'الخامة' : 'Fabric & Material'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'fabric' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeAccordion === 'fabric' && (
                    <div className="mt-2.5 space-y-2 text-neutral-600 leading-relaxed">
                      <p><strong className="text-black">{isArabic ? 'الخامة:' : 'Fabric:'}</strong> {isArabic && product.fabricAr ? product.fabricAr : product.fabric}</p>
                    </div>
                  )}
                </div>

                {/* Care Instructions Accordion */}
                <div className="border-b border-neutral-200 py-3">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'care' ? null : 'care')}
                    className="w-full flex items-center justify-between font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
                  >
                    <span>{isArabic ? 'تعليمات الغسيل والعناية' : 'Care Instructions'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'care' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeAccordion === 'care' && (
                    <ul className="mt-2.5 space-y-1 text-neutral-600 list-disc list-inside">
                      {product.careInstructions.map((care, i) => (
                        <li key={i}>{care}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Guaranteed Returns & Exchanges Accordion */}
                <div className="py-3">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'returns' ? null : 'returns')}
                    className="w-full flex items-center justify-between font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
                  >
                    <span>{isArabic ? 'سياسة الاستبدال والاسترجاع' : 'Guaranteed Returns & Exchanges'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'returns' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeAccordion === 'returns' && (
                    <p className="mt-2.5 text-neutral-600 leading-relaxed">
                      {isArabic
                        ? 'إمكانية المعاينة عند الاستلام واستبدال أو استرجاع المقاس خلال 14 يوماً بسهولة تامة وبدون أي تعقيدات.'
                        : 'Try it on at delivery with 14-day hassle-free exchange & refund guarantee.'}
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

