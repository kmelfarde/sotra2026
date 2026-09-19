import React from 'react';

interface HeroProps {
  onShopAll?: () => void;
  onShopNow?: () => void;
  onNewArrivals?: () => void;
  onExploreSets?: () => void;
  isArabic: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onShopAll,
  onShopNow,
  onNewArrivals,
  onExploreSets,
  isArabic
}) => {
  const handleShop = onShopNow || onShopAll || (() => {});
  const handleArrivalsOrSets = onExploreSets || onNewArrivals || (() => {});
  return (
    <section className="relative w-full bg-neutral-950 text-white overflow-hidden select-none">
      {/* Background Image with Dark Vignette */}
      <div className="relative min-h-[460px] sm:min-h-[520px] md:min-h-[580px] flex items-end pb-10 sm:pb-14 justify-center">
        {/* Main Hero Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop"
            alt="SOTRA Fashion"
            className="w-full h-full object-cover object-center opacity-65 filter contrast-110 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/70" />
        </div>

        {/* Large Textured Typography */}
        <div className="absolute top-12 sm:top-16 inset-x-0 flex flex-col items-center justify-center z-10 pointer-events-none text-center px-4">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase font-stencil text-neutral-200/85 leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            SOTRA
          </h1>
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-neutral-400 mt-1">
            FASHION &amp; STREETWEAR
          </span>
        </div>

        {/* Foreground Content: Only "وصل حديثاً" & "تسوق الكل" */}
        <div className="relative z-20 max-w-lg mx-auto px-4 text-center flex flex-col items-center w-full">
          <div className="flex flex-row items-center justify-center gap-3 w-full max-w-sm">
            <button
              onClick={handleArrivalsOrSets}
              className="flex-1 py-3.5 px-4 bg-white text-black hover:bg-neutral-200 text-xs sm:text-sm font-black uppercase tracking-widest rounded-none shadow-xl transition cursor-pointer text-center"
            >
              {isArabic ? 'وصل حديثاً' : 'New Arrivals'}
            </button>
            <button
              onClick={handleShop}
              className="flex-1 py-3.5 px-4 bg-transparent text-white border-2 border-white hover:bg-white hover:text-black text-xs sm:text-sm font-black uppercase tracking-widest rounded-none shadow-xl transition cursor-pointer text-center"
            >
              {isArabic ? 'تسوق الكل' : 'Shop All'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
