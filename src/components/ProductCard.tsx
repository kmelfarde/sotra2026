import React, { useState } from 'react';
import { ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { Product, CurrencyCode } from '../types';

interface ProductCardProps {
  product: Product;
  currency: CurrencyCode;
  currencyRate: number;
  onSelectProduct: (product: Product, initialColorId?: string) => void;
  onQuickAdd: (product: Product, colorId: string) => void;
  isArabic: boolean;
  rankBadge?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  currencyRate,
  onSelectProduct,
  onQuickAdd,
  isArabic,
  rankBadge
}) => {
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [quickAddSuccess, setQuickAddSuccess] = useState(false);

  const colors = product.colors || [];
  const activeColor = colors[activeColorIndex] || colors[0] || {
    id: 'default',
    name: 'Default',
    hex: '#000000',
    images: []
  };

  // Calculate total stock across this product's colors/sizes
  const totalStock = React.useMemo(() => {
    let sum = 0;
    if (product.colors && product.colors.length > 0) {
      for (const col of product.colors) {
        if (col.sizesStock && col.sizesStock.length > 0) {
          for (const sz of col.sizesStock) {
            sum += sz.stockCount || 0;
          }
        }
      }
    }
    if (sum === 0 && product.sizes && product.sizes.length > 0) {
      for (const sz of product.sizes) {
        sum += sz.stockCount || (sz.inStock ? 10 : 0);
      }
    }
    return sum;
  }, [product]);

  const isSoldOut = product.inStock === false || totalStock <= 0;

  // Active color images
  const primaryImage = activeColor.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
  const secondaryImage = activeColor.images?.[1] || primaryImage;
  const currentImage = isHovered && secondaryImage !== primaryImage ? secondaryImage : primaryImage;

  // Currency formatting
  const convertedOriginal = (product.originalPrice * currencyRate).toFixed(0);
  const convertedPrice = (product.discountedPrice * currencyRate).toFixed(0);

  const currencySymbol = currency === 'EGP' ? (isArabic ? 'ج.م' : 'EGP')
    : currency === 'SAR' ? (isArabic ? 'ر.س' : 'SAR')
    : currency === 'AED' ? (isArabic ? 'د.إ' : 'AED')
    : '$';

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    onQuickAdd(product, activeColor.id);
    setQuickAddSuccess(true);
    setTimeout(() => setQuickAddSuccess(false), 1600);
  };

  return (
    <div
      onClick={() => onSelectProduct(product, activeColor.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white border border-neutral-100 hover:border-neutral-300 hover:shadow-lg transition-all duration-300 cursor-pointer rounded-lg overflow-hidden"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
        <img
          src={currentImage}
          alt={isArabic && product.nameAr ? product.nameAr : product.name}
          loading="lazy"
          className={`h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105 ${
            isSoldOut ? 'opacity-50 grayscale' : ''
          }`}
        />

        {/* Badges Container */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-start justify-between pointer-events-none z-10">
          <div className="flex flex-col gap-1.5 items-start">
            {rankBadge && (
              <span className="px-2 py-0.5 bg-neutral-900 text-white font-black text-[10px] tracking-wider uppercase rounded shadow-xs">
                {rankBadge}
              </span>
            )}
            {product.discountPercent && product.discountPercent > 0 && (
              <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] tracking-wider rounded shadow-xs">
                -{product.discountPercent}%
              </span>
            )}
            {product.badge && (
              <span className="px-2 py-0.5 bg-black text-white font-bold text-[9px] uppercase tracking-wider rounded shadow-xs">
                {product.badge}
              </span>
            )}
          </div>

          {/* User directive: ONLY show stock hint if EXACTLY 1 piece remains in stock */}
          {totalStock === 1 && !isSoldOut && (
            <span className="px-2 py-0.5 bg-amber-500 text-neutral-950 font-black text-[10px] rounded shadow-xs animate-pulse">
              {isArabic ? 'متبقي قطعة واحدة فقط!' : 'Only 1 left!'}
            </span>
          )}

          {isSoldOut && (
            <span className="px-2 py-0.5 bg-neutral-800 text-white font-black text-[10px] rounded shadow-xs">
              {isArabic ? 'نفد من المخزون' : 'Sold Out'}
            </span>
          )}
        </div>

        {/* Quick Add Overlay Button on Desktop */}
        <div className="absolute bottom-2.5 inset-x-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex gap-1.5 z-10">
          <button
            type="button"
            disabled={isSoldOut}
            onClick={handleQuickAddClick}
            className={`flex-1 py-2 px-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 rounded transition shadow-md ${
              quickAddSuccess
                ? 'bg-green-600 text-white'
                : isSoldOut
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-neutral-800 cursor-pointer'
            }`}
          >
            {quickAddSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isArabic ? 'تمت الإضافة' : 'Added'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إضافة سريعة' : 'Quick Add'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product, activeColor.id);
            }}
            aria-label="View Details"
            className="p-2 bg-white/90 hover:bg-white text-neutral-900 rounded shadow-md transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Color Swatches */}
          {colors.length > 1 && (
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto py-0.5 scrollbar-none" onClick={(e) => e.stopPropagation()}>
              {colors.map((c, idx) => (
                <button
                  key={c.id || idx}
                  type="button"
                  onClick={() => setActiveColorIndex(idx)}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    activeColorIndex === idx
                      ? 'ring-2 ring-black ring-offset-1 scale-110'
                      : 'border-neutral-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              <span className="text-[10px] text-neutral-400 font-medium ms-1">
                {colors.length} {isArabic ? 'ألوان' : 'colors'}
              </span>
            </div>
          )}

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-black transition">
            {isArabic && product.nameAr ? product.nameAr : product.name}
          </h3>

          {/* Fit & Category info */}
          <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
            {isArabic && product.fitAr ? product.fitAr : product.fit || product.category}
          </p>
        </div>

        {/* Rating & Pricing Row */}
        <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-neutral-950">
              {convertedPrice} <span className="text-[10px] font-bold text-neutral-600">{currencySymbol}</span>
            </span>
            {product.originalPrice > product.discountedPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {convertedOriginal} {currencySymbol}
              </span>
            )}
          </div>

          {product.rating > 0 && (
            <div className="flex items-center gap-0.5 text-amber-500 text-xs">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-bold text-neutral-700">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
