import React from 'react';
import { CATEGORIES_DATA } from '../data/products';
import { CategoryTab, StoreCategory } from '../types';

interface CategoryCarouselProps {
  selectedCategory: CategoryTab;
  onSelectCategory: (category: CategoryTab) => void;
  categories?: StoreCategory[];
  isArabic: boolean;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  selectedCategory,
  onSelectCategory,
  categories,
  isArabic
}) => {
  const displayCategories = categories && categories.length > 0 ? categories : CATEGORIES_DATA;

  return (
    <div className="w-full bg-white py-4 sm:py-6 border-b border-neutral-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Horizontal Category Cards Carousel matching exact Mavin screenshot */}
        <div className="flex items-center space-x-3 sm:space-x-4 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {displayCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id as CategoryTab)}
                className={`group shrink-0 flex flex-col items-center focus:outline-none transition-transform duration-200 ${
                  isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
              >
                {/* Category Image Card */}
                <div
                  className={`relative w-32 sm:w-40 aspect-[4/5] rounded-lg sm:rounded-xl overflow-hidden bg-neutral-100 border transition-all duration-200 ${
                    isSelected
                      ? 'border-neutral-900 ring-2 ring-neutral-900 shadow-md'
                      : 'border-neutral-200 group-hover:border-neutral-400'
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />
                  
                  {/* Category Label at Bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 text-center">
                    <span className="block text-xs sm:text-sm font-black text-white tracking-wide uppercase drop-shadow-md truncate">
                      {isArabic ? cat.nameAr : cat.name}
                    </span>
                    <span className="block text-[10px] text-neutral-300 font-bold uppercase tracking-widest mt-0.5">
                      {cat.count} {isArabic ? 'منتجات' : 'items'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
