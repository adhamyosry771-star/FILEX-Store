
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { BannerData } from '../types';

interface BannerProps {
  banners: BannerData[];
}

const Banner: React.FC<BannerProps> = ({ banners }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

  if (banners.length === 0) {
    return (
        <div className="w-full aspect-[2/1] md:aspect-[3/1] lg:aspect-[4/1] bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center border border-slate-700/50 my-4 shadow-lg">
             <Loader2 className="animate-spin text-slate-600" size={32} />
        </div>
    );
  }

  return (
    <div className="relative w-full aspect-[2/1] md:aspect-[3/1] lg:aspect-[4/1] overflow-hidden rounded-2xl my-4 shadow-xl group border border-slate-700/50 transform-gpu isolate">
      {/* GLOW OVERLAY STABILIZER */}
      <div className="absolute inset-0 z-[5] pointer-events-none bg-slate-900/10"></div>
      
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out transform-gpu ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-20 opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/80 via-slate-900/20 to-transparent z-20" />
          
          <img 
            src={banner.image} 
            alt={banner.title} 
            className="w-full h-full object-cover transform scale-100 group-hover:scale-[1.02] transition-transform duration-[2000ms] ease-out"
          />

          {/* Text Container - Lifted and Sized up */}
          <div className="absolute bottom-6 md:bottom-12 right-0 p-5 md:p-10 z-30 w-full md:w-3/4 text-right">
             <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 text-[10px] md:text-xs font-bold rounded-full mb-3 border border-teal-500/30 backdrop-blur-sm shadow-sm">
              مميز
            </span>
            {/* Changed font-black to font-bold for a slightly thinner look */}
            <h2 className="text-2xl md:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
              {banner.title}
            </h2>
            <p className="text-slate-300 text-sm md:text-xl mb-2 opacity-90 font-medium line-clamp-2 max-w-xl drop-shadow-md leading-relaxed">
              {banner.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={nextSlide} 
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-teal-500 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-40 shadow-lg"
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <button 
            onClick={prevSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-teal-500 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-40 shadow-lg"
          >
            <ChevronRight size={20} className="md:w-6 md:h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-40">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === current ? 'bg-teal-500 w-6 md:w-8' : 'bg-white/30 w-1.5 md:w-2'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Banner;
