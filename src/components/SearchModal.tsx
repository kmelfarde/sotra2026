import React, { useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { Product, CurrencyCode } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  currency: CurrencyCode;
  currencyRate: number;
  isArabic: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  products,
  onSelectProduct,
  currency,
  currencyRate,
  isArabic
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = normalizedQuery
    ? products.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const nameAr = (p.nameAr || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const descAr = (p.descriptionAr || '').toLowerCase();
        return (
          name.includes(normalizedQuery) ||
          nameAr.includes(normalizedQuery) ||
          cat.includes(normalizedQuery) ||
          desc.includes(normalizedQuery) ||
          descAr.includes(normalizedQuery)
        );
      })
    : [];

  const currencySymbol = currency === 'EGP' ? (isArabic ? 'ج.م' : 'EGP')
    : currency === 'SAR' ? (isArabic ? 'ر.س' : 'SAR')
    : currency === 'AED' ? (isArabic ? 'د.إ' : 'AED')
    : '$';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isArabic ? 'ابحث عن تيشرت، هودي، أوفر سايز، بنطلون...' : 'Search for t-shirts, hoodies, oversize, pants...'}
            className="w-full text-base font-medium outline-none placeholder:text-neutral-400 text-neutral-900 bg-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700 font-bold text-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results / Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {searchQuery.trim() === '' ? (
            <div className="py-8 text-center text-neutral-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">
                {isArabic ? 'اكتب اسم المنتج أو الموديل للبحث السريع' : 'Type a product name or category to search'}
              </p>
              {/* Popular Search Suggestions */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Oversized', 'Compression', 'Hoodie', 'Pants', 'Tanks'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onSearchChange(tag)}
                    className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full font-medium transition cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-neutral-500">
              <p className="text-sm font-bold text-neutral-700 mb-1">
                {isArabic ? 'لا توجد نتائج مطابقة' : 'No results found'}
              </p>
              <p className="text-xs text-neutral-400">
                {isArabic ? `لم نتمكن من العثور على أي منتج يطابق "${searchQuery}"` : `Could not find anything matching "${searchQuery}"`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                {isArabic ? `النتائج (${filteredProducts.length})` : `Results (${filteredProducts.length})`}
              </p>
              {filteredProducts.map((product) => {
                const img = product.colors?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300';
                const price = (product.discountedPrice * currencyRate).toFixed(0);
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-neutral-50 rounded-lg transition cursor-pointer border border-transparent hover:border-neutral-200"
                  >
                    <img
                      src={img}
                      alt={product.name}
                      className="w-12 h-14 object-cover object-top rounded bg-neutral-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                        {isArabic && product.nameAr ? product.nameAr : product.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {isArabic && product.fitAr ? product.fitAr : product.fit || product.category}
                      </p>
                    </div>
                    <div className="text-end shrink-0">
                      <span className="text-xs sm:text-sm font-black text-neutral-950">
                        {price} {currencySymbol}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
