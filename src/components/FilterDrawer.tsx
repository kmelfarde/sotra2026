import React from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { FilterOptions, CategoryTab } from '../types';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onChangeFilters: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  totalResults: number;
  isArabic: boolean;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onChangeFilters,
  onResetFilters,
  totalResults,
  isArabic
}) => {
  if (!isOpen) return null;

  const sizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const colorsList = [
    { name: 'Black', hex: '#0a0a0a' },
    { name: 'Red', hex: '#dc2626' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Olive', hex: '#3f4f38' },
    { name: 'Navy', hex: '#1e3a8a' },
    { name: 'White', hex: '#fafafa', border: true },
    { name: 'Grey', hex: '#64748b' },
    { name: 'Burgundy', hex: '#881337' }
  ];

  const handleToggleSize = (size: string) => {
    const next = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onChangeFilters({ ...filters, sizes: next });
  };

  const handleToggleColor = (colorName: string) => {
    const next = filters.colors.includes(colorName)
      ? filters.colors.filter((c) => c !== colorName)
      : [...filters.colors, colorName];
    onChangeFilters({ ...filters, colors: next });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-black uppercase tracking-wider font-heading text-neutral-950">
              {isArabic ? 'تصفية وترتيب' : 'Filter & Sort'}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onResetFilters}
              className="text-[11px] font-bold text-neutral-500 hover:text-black flex items-center space-x-1 cursor-pointer p-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isArabic ? 'إعادة ضبط' : 'Reset'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-neutral-600 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Filters Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
          {/* Sort By */}
          <div>
            <h3 className="font-extrabold uppercase tracking-wider text-neutral-900 mb-2">
              Sort By
            </h3>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onChangeFilters({ ...filters, sortBy: e.target.value as any })
              }
              className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs font-semibold focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="featured">Featured / Best Matches</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>

          {/* Size Filter */}
          <div>
            <h3 className="font-extrabold uppercase tracking-wider text-neutral-900 mb-2">
              Sizes
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((s) => {
                const checked = filters.sizes.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => handleToggleSize(s)}
                    className={`py-2 text-xs font-bold uppercase transition border ${
                      checked
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h3 className="font-extrabold uppercase tracking-wider text-neutral-900 mb-2">
              Colors
            </h3>
            <div className="flex flex-wrap gap-2">
              {colorsList.map((c) => {
                const checked = filters.colors.includes(c.name);
                return (
                  <button
                    key={c.name}
                    onClick={() => handleToggleColor(c.name)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 border rounded-full transition ${
                      checked
                        ? 'border-black bg-neutral-900 text-white font-bold'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{
                        backgroundColor: c.hex,
                        border: c.border ? '1px solid #ccc' : 'none'
                      }}
                    />
                    <span className="text-[11px]">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="space-y-2 border-t border-neutral-200 pt-4">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.onlyDiscounted}
                onChange={(e) =>
                  onChangeFilters({ ...filters, onlyDiscounted: e.target.checked })
                }
                className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-semibold text-neutral-900">
                On Sale / Discounted Items Only
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.onlyInStock}
                onChange={(e) =>
                  onChangeFilters({ ...filters, onlyInStock: e.target.checked })
                }
                className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-semibold text-neutral-900">
                In Stock Items Only
              </span>
            </label>
          </div>
        </div>

        {/* Footer Apply Button */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-widest transition cursor-pointer"
          >
            Apply Filters ({totalResults} Products)
          </button>
        </div>
      </div>
    </div>
  );
};
