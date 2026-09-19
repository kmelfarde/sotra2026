import React from 'react';
import { Instagram, Flame } from 'lucide-react';

interface LookbookProps {
  onShopProduct: (id?: string) => void;
  isArabic: boolean;
}

export const LookbookSection: React.FC<LookbookProps> = ({ onShopProduct, isArabic }) => {
  const lookbookImages = [
    {
      img: 'https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?q=80&w=600&auto=format&fit=crop',
      tag: '@omar.fit in Stealth Compression Tee'
    },
    {
      img: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=600&auto=format&fit=crop',
      tag: '@kareem.style in Stealth Stripe Pants'
    },
    {
      img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=600&auto=format&fit=crop',
      tag: '@sotra.apparel in Rival Oversized Raglan'
    },
    {
      img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=600&auto=format&fit=crop',
      tag: '@ahmed.wear in Essential Cotton Shorts'
    }
  ];

  return (
    <section className="w-full bg-neutral-950 text-white py-12 sm:py-16 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-red-500 text-xs font-bold uppercase tracking-widest mb-1.5">
              <Flame className="w-4 h-4" />
              <span>SOTRA ATHLETES &amp; COMMUNITY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-heading">
              {isArabic ? 'مجتمع وأبطال سوترة' : 'JOIN THE SOTRA MOVEMENT'}
            </h2>
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="mt-3 sm:mt-0 inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition"
          >
            <Instagram className="w-4 h-4" />
            <span>Tag @sotra.fashion</span>
          </a>
        </div>

        {/* Lookbook 4-Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {lookbookImages.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onShopProduct()}
              className="group relative aspect-[3/4] bg-neutral-900 overflow-hidden cursor-pointer"
            >
              <img
                src={item.img}
                alt="SOTRA Athlete"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition" />
              <div className="absolute bottom-2.5 inset-x-2.5 text-center">
                <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider line-clamp-1">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
